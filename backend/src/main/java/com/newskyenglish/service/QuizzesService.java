package com.newskyenglish.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newskyenglish.dto.quizzes.QuizzesCreateRequest;
import com.newskyenglish.dto.quizzes.QuizzesDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.exception.ForbiddenException;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Questions;
import com.newskyenglish.model.QuestionGroups;
import com.newskyenglish.model.Quizzes;
import com.newskyenglish.model.QuizSubmissions;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.QuestionGroupsRepository;
import com.newskyenglish.repository.QuestionsRepository;
import com.newskyenglish.repository.QuizzesRepository;
import com.newskyenglish.repository.QuizSubmissionsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
// Quản lý quiz, nhóm câu hỏi, câu hỏi và lịch sử nộp bài liên quan.
public class QuizzesService {

    // Repository layer phục vụ CRUD quiz, question và submission liên quan.
    private final QuizzesRepository quizRepository;
    private final QuestionGroupsRepository questionGroupRepository;
    private final QuestionsRepository questionRepository;
    private final QuizSubmissionsRepository submissionRepository;
    private final ClassesRepository classesRepository;
    private final EnrollmentsRepository enrollmentsRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    // Lấy toàn bộ quiz để hiển thị ở admin và student.
    public List<QuizzesDTO.Response> getAll() {
        return quizRepository.findAll().stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy quiz theo lớp học để admin/teacher/student chỉ nhìn đúng bài kiểm tra liên quan.
    public List<QuizzesDTO.Response> getByClass(Long classId) {
        return quizRepository.findByClassId(classId).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lọc quiz theo loại chứng chỉ như IELTS hoặc TOEIC.
    public List<QuizzesDTO.Response> getByType(Quizzes.ExamType examType) {
        return quizRepository.findByExamType(examType).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy full dữ liệu quiz cho màn quản trị/chấm bài hoặc màn review sau khi học viên đã nộp.
    public QuizzesDTO.FullResponse getFullQuiz(Long id, String authorizationHeader) {
        Quizzes quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quiz"));
        ensureFullQuizAccess(quiz, authorizationHeader);
        List<QuestionGroups> groups = questionGroupRepository.findByQuizIdOrderByOrderNumAsc(id);
        List<Questions> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(id);

        return QuizzesDTO.FullResponse.builder()
                .quiz(toQuizResponse(quiz, (long) questions.size()))
                .groups(groups.stream().map(QuizzesDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizzesDTO.QuestionDetailResponse::fromEntity).toList())
                .build();
    }

    @Transactional(readOnly = true)
    // Lấy quiz cho học viên làm bài và ẩn đáp án đúng.
    public QuizzesDTO.StudentQuizResponse getStudentQuiz(Long quizId, String authorizationHeader) {
        Quizzes quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài quiz"));
        ensureStudentHasQuizAccess(quiz, currentUserService.extractUserId(authorizationHeader));

        List<QuestionGroups> groups = questionGroupRepository.findByQuizIdOrderByOrderNumAsc(quizId);
        List<Questions> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(quizId);

        return QuizzesDTO.StudentQuizResponse.builder()
                .quiz(toQuizResponse(quiz, (long) questions.size()))
                .groups(groups.stream().map(QuizzesDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizzesDTO.QuestionResponse::fromEntity).toList())
                .build();
    }

    @Transactional
    // Tạo quiz mới và đồng thời lưu các group/question đi kèm.
    public QuizzesDTO.Response create(QuizzesCreateRequest request) {
        // Tạo bản ghi quiz chính trước để lấy id gắn cho group/question con.
        Quizzes quiz = Quizzes.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .type(request.getType() != null ? request.getType() : Quizzes.QuizType.mcq)
                .examType(request.getExamType() != null ? request.getExamType() : Quizzes.ExamType.OTHER)
                .examPart(request.getExamPart())
                .passageText(request.getPassageText())
                .audioUrl(request.getAudioUrl())
                .instructions(request.getInstructions())
                .timeLimit(request.getTimeLimit())
                .build();

        Quizzes createdQuiz = quizRepository.save(quiz);

        if (request.getGroups() != null) {
            for (QuizzesCreateRequest.GroupRequest groupRequest : request.getGroups()) {
                QuestionGroups group = QuestionGroups.builder()
                        .quizId(createdQuiz.getId())
                        .title(groupRequest.getTitle())
                        .passageText(groupRequest.getPassageText())
                        .imageUrl(groupRequest.getImageUrl())
                        .audioUrl(groupRequest.getAudioUrl())
                        .instructions(groupRequest.getInstructions())
                        .orderNum(groupRequest.getOrderNum() != null ? groupRequest.getOrderNum() : 1)
                        .build();
                questionGroupRepository.save(group);
            }
        }

        if (request.getQuestions() != null) {
            for (QuizzesCreateRequest.QuestionRequest questionRequest : request.getQuestions()) {
                Questions question = Questions.builder()
                        .quizId(createdQuiz.getId())
                        .groupId(questionRequest.getGroupId())
                        .questionType(questionRequest.getQuestionType())
                        .content(questionRequest.getContent())
                        .imageUrl(questionRequest.getImageUrl())
                        .audioUrl(questionRequest.getAudioUrl())
                        .optionA(questionRequest.getOptionA())
                        .optionB(questionRequest.getOptionB())
                        .optionC(questionRequest.getOptionC())
                        .optionD(questionRequest.getOptionD())
                        .correctAnswer(questionRequest.getCorrectAnswer())
                        .explanation(questionRequest.getExplanation())
                        .orderNum(questionRequest.getOrderNum() != null ? questionRequest.getOrderNum() : 1)
                        .build();
                questionRepository.save(question);
            }
        }

        return toQuizResponse(createdQuiz, request.getQuestions() != null ? (long) request.getQuestions().size() : 0L);
    }

    @Transactional
    // Cập nhật metadata cơ bản của quiz hiện có.
    public QuizzesDTO.Response update(Long id, QuizzesCreateRequest request) {
        Quizzes quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quiz"));

        if (request.getClassId() != null) quiz.setClassId(request.getClassId());
        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getType() != null) quiz.setType(request.getType());
        if (request.getExamType() != null) quiz.setExamType(request.getExamType());
        if (request.getExamPart() != null) quiz.setExamPart(request.getExamPart());
        if (request.getPassageText() != null) quiz.setPassageText(request.getPassageText());
        if (request.getAudioUrl() != null) quiz.setAudioUrl(request.getAudioUrl());
        if (request.getInstructions() != null) quiz.setInstructions(request.getInstructions());
        if (request.getTimeLimit() != null) quiz.setTimeLimit(request.getTimeLimit());

        Quizzes updatedQuiz = quizRepository.save(quiz);
        if (request.getGroups() != null) {
            questionGroupRepository.deleteByQuizId(id);
            for (QuizzesCreateRequest.GroupRequest groupRequest : request.getGroups()) {
                QuestionGroups group = QuestionGroups.builder()
                        .quizId(updatedQuiz.getId())
                        .title(groupRequest.getTitle())
                        .passageText(groupRequest.getPassageText())
                        .imageUrl(groupRequest.getImageUrl())
                        .audioUrl(groupRequest.getAudioUrl())
                        .instructions(groupRequest.getInstructions())
                        .orderNum(groupRequest.getOrderNum() != null ? groupRequest.getOrderNum() : 1)
                        .build();
                questionGroupRepository.save(group);
            }
        }
        if (request.getQuestions() != null) {
            questionRepository.deleteByQuizId(id);
            for (QuizzesCreateRequest.QuestionRequest questionRequest : request.getQuestions()) {
                Questions question = Questions.builder()
                        .quizId(updatedQuiz.getId())
                        .groupId(questionRequest.getGroupId())
                        .questionType(questionRequest.getQuestionType())
                        .content(questionRequest.getContent())
                        .imageUrl(questionRequest.getImageUrl())
                        .audioUrl(questionRequest.getAudioUrl())
                        .optionA(questionRequest.getOptionA())
                        .optionB(questionRequest.getOptionB())
                        .optionC(questionRequest.getOptionC())
                        .optionD(questionRequest.getOptionD())
                        .correctAnswer(questionRequest.getCorrectAnswer())
                        .explanation(questionRequest.getExplanation())
                        .orderNum(questionRequest.getOrderNum() != null ? questionRequest.getOrderNum() : 1)
                        .build();
                questionRepository.save(question);
            }
        }
        return toQuizResponse(updatedQuiz, request.getQuestions() != null
                ? (long) request.getQuestions().size()
                : questionRepository.countByQuizId(updatedQuiz.getId()));
    }

    @Transactional
    // Xóa một quiz theo id.
    public void delete(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy quiz");
        }
        quizRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    // Lấy toàn bộ submission của một quiz để admin/teacher xem kết quả.
    public List<QuizzesDTO.SubmissionResponse> getQuizSubmissions(Long id) {
        return submissionRepository.findByQuizId(id).stream()
                .map(QuizzesDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch sử submission quiz của một user.
    public List<QuizzesDTO.SubmissionResponse> getUserSubmissions(Long userId, String authorizationHeader) {
        ensureSelfOrAdmin(userId, authorizationHeader);
        return submissionRepository.findByUserId(userId).stream()
                .map(QuizzesDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy các bài kiểm tra thuộc lớp mà giáo viên hiện tại đang phụ trách.
    public List<QuizzesDTO.Response> getTeacherQuizzes(String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        List<Long> classIds = classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .toList();

        return quizRepository.findByClassIdIn(classIds).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài làm của một quiz nếu quiz đó thuộc lớp giáo viên quản lý.
    public List<QuizzesDTO.SubmissionResponse> getTeacherQuizSubmissions(Long quizId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Quizzes quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài kiểm tra"));
        assertTeacherOwnsQuiz(teacherId, quiz);

        return submissionRepository.findByQuizId(quizId).stream()
                .map(QuizzesDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional
    // Học viên nộp bài quiz, backend sẽ tự chấm phần trắc nghiệm có thể auto-grade.
    public QuizzesDTO.SubmitResultResponse submitStudentQuiz(Long quizId,
                                                             QuizzesDTO.SubmitRequest request,
                                                             String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        Quizzes quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài quiz"));
        ensureStudentHasQuizAccess(quiz, userId);

        Map<String, Object> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        List<Questions> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(quizId);
        int correctCount = 0;
        int autoGradableQuestionCount = 0;
        Map<String, Object> normalizedAnswers = new LinkedHashMap<>();

        for (Questions question : questions) {
            Object answer = submittedAnswers.get(String.valueOf(question.getId()));
            if (answer == null) {
                answer = submittedAnswers.get(question.getId());
            }
            String normalizedAnswer = answer != null ? answer.toString().trim() : "";
            normalizedAnswers.put(String.valueOf(question.getId()), normalizedAnswer);

            if ("writing".equalsIgnoreCase(question.getQuestionType())) {
                continue;
            }

            autoGradableQuestionCount++;
            String correctAnswer = question.getCorrectAnswer() != null
                    ? question.getCorrectAnswer().trim()
                    : "";
            if (normalizedAnswer.equalsIgnoreCase(correctAnswer)) {
                correctCount++;
            }
        }

        int score = autoGradableQuestionCount > 0
                ? Math.round((correctCount * 100f) / autoGradableQuestionCount)
                : 0;

        QuizSubmissions submission = submissionRepository.findFirstByQuizIdAndUserId(quizId, userId)
                .orElseGet(QuizSubmissions::new);
        submission.setQuizId(quiz.getId());
        submission.setUserId(userId);
        submission.setAnswers(writeAnswersAsJson(normalizedAnswers));
        submission.setScore((float) score);
        submission.setTimeSpent(request.getTimeSpent());
        submission.setSubmittedAt(LocalDateTime.now());
        submissionRepository.save(submission);

        return QuizzesDTO.SubmitResultResponse.builder()
                .submissionId(submission.getId())
                .correct(correctCount)
                .total(autoGradableQuestionCount)
                .score(score)
                .build();
    }

    @Transactional
    // Giáo viên chấm hoặc sửa điểm cuối cùng cho bài làm quiz thuộc lớp mình.
    public QuizzesDTO.SubmissionResponse gradeTeacherSubmission(Long submissionId,
                                                                QuizzesDTO.GradeSubmissionRequest request,
                                                                String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        QuizSubmissions submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài làm quiz"));
        Quizzes quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bài kiểm tra"));
        assertTeacherOwnsQuiz(teacherId, quiz);

        submission.setScore(request.getScore());
        return QuizzesDTO.SubmissionResponse.fromEntity(submissionRepository.save(submission));
    }

    // Map quiz entity sang response đồng nhất có kèm số lượng câu hỏi.
    private QuizzesDTO.Response toQuizResponse(Quizzes quiz) {
        return toQuizResponse(quiz, questionRepository.countByQuizId(quiz.getId()));
    }

    // Cho phép tái sử dụng khi service đã có sẵn questionCount từ truy vấn trước đó.
    private QuizzesDTO.Response toQuizResponse(Quizzes quiz, Long questionCount) {
        return QuizzesDTO.Response.fromEntity(quiz, questionCount);
    }

    // Lưu đáp án theo JSON để frontend có thể parse khi xem lại bài làm.
    private String writeAnswersAsJson(Map<String, Object> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Không thể lưu bài làm quiz");
        }
    }

    // Đảm bảo giáo viên chỉ thao tác với bài kiểm tra thuộc lớp mình.
    private void assertTeacherOwnsQuiz(Long teacherId, Quizzes quiz) {
        if (quiz.getClassId() == null) {
            throw new ForbiddenException("Bài kiểm tra chưa gắn với lớp học");
        }

        Classes classRoom = classesRepository.findById(quiz.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học"));
        if (!teacherId.equals(classRoom.getTeacherId())) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài kiểm tra này");
        }
    }

    // Chỉ chính chủ hoặc admin mới được xem lịch sử submission theo userId.
    private void ensureSelfOrAdmin(Long targetUserId, String authorizationHeader) {
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);
        if (currentUserId.equals(targetUserId)) {
            return;
        }

        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        throw new ForbiddenException("Bạn không có quyền xem kết quả của người dùng này");
    }

    // Học viên chỉ được xem/làm quiz thuộc lớp mình đang hoặc đã học.
    private void ensureStudentHasQuizAccess(Quizzes quiz, Long userId) {
        if (quiz.getClassId() == null) {
            throw new ForbiddenException("Bài quiz này chưa gắn với lớp học");
        }

        boolean hasAccess = enrollmentsRepository.findByUserId(userId).stream()
                .anyMatch(enrollment -> quiz.getClassId().equals(enrollment.getClassId())
                        && (enrollment.getStatus() == Enrollments.Status.approved
                        || enrollment.getStatus() == Enrollments.Status.enrolled
                        || enrollment.getStatus() == Enrollments.Status.completed));
        if (!hasAccess) {
            throw new ForbiddenException("Bạn chưa được ghi danh vào lớp của bài kiểm tra này");
        }
    }

    // Endpoint full chỉ cho admin, giáo viên sở hữu lớp hoặc học viên đã nộp bài dùng để xem lại.
    private void ensureFullQuizAccess(Quizzes quiz, String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        Long currentUserId = currentUserService.extractUserId(authorizationHeader);

        if (Integer.valueOf(1).equals(currentRoleId)) {
            return;
        }

        if (Integer.valueOf(2).equals(currentRoleId)) {
            assertTeacherOwnsQuiz(currentUserId, quiz);
            return;
        }

        if (Integer.valueOf(3).equals(currentRoleId)) {
            ensureStudentHasQuizAccess(quiz, currentUserId);
            boolean hasSubmitted = submissionRepository.findFirstByQuizIdAndUserId(quiz.getId(), currentUserId).isPresent();
            if (!hasSubmitted) {
                throw new ForbiddenException("Bạn chỉ có thể xem lại bài kiểm tra sau khi đã nộp bài");
            }
            return;
        }

        throw new ForbiddenException("Bạn không có quyền xem chi tiết bài kiểm tra này");
    }
}

