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
import com.newskyenglish.model.QuestionGroups;
import com.newskyenglish.model.Questions;
import com.newskyenglish.model.QuizClasses;
import com.newskyenglish.model.Quizzes;
import com.newskyenglish.model.QuizSubmissions;
import com.newskyenglish.repository.ClassesRepository;
import com.newskyenglish.repository.EnrollmentsRepository;
import com.newskyenglish.repository.QuestionGroupsRepository;
import com.newskyenglish.repository.QuestionsRepository;
import com.newskyenglish.repository.QuizClassesRepository;
import com.newskyenglish.repository.QuizSubmissionsRepository;
import com.newskyenglish.repository.QuizzesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
// Quản lý quiz, liên kết lớp học, nhóm câu hỏi, câu hỏi và lịch sử nộp bài liên quan.
public class QuizzesService {

    private final QuizzesRepository quizRepository;
    private final QuizClassesRepository quizClassesRepository;
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
    // Lấy quiz theo lớp học thông qua bảng quiz_classes của schema mới.
    public List<QuizzesDTO.Response> getByClass(Long classId) {
        List<Long> quizIds = quizClassesRepository.findByClassId(classId).stream()
                .map(QuizClasses::getQuizId)
                .distinct()
                .toList();
        return getQuizzesByIds(quizIds).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lọc quiz theo loại chứng chỉ như IELTS hoặc TOEIC.
    public List<QuizzesDTO.Response> getByType(Quizzes.Type type) {
        return quizRepository.findByType(type).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy full dữ liệu quiz cho màn quản trị/chấm bài hoặc màn review sau khi học viên đã nộp.
    public QuizzesDTO.FullResponse getFullQuiz(Long id, String authorizationHeader) {
        Quizzes quiz = findQuiz(id);
        ensureFullQuizAccess(quiz, authorizationHeader);
        List<QuestionGroups> groups = getQuizGroups(id);
        List<Questions> questions = getQuestionsByGroups(groups);

        return QuizzesDTO.FullResponse.builder()
                .quiz(toQuizResponse(quiz, groups, questions))
                .groups(groups.stream().map(QuizzesDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizzesDTO.QuestionDetailResponse::fromEntity).toList())
                .build();
    }

    @Transactional(readOnly = true)
    // Lấy quiz cho học viên làm bài và ẩn đáp án đúng.
    public QuizzesDTO.StudentQuizResponse getStudentQuiz(Long quizId, String authorizationHeader) {
        Quizzes quiz = findQuiz(quizId);
        ensureStudentHasQuizAccess(quiz, currentUserService.extractUserId(authorizationHeader));

        List<QuestionGroups> groups = getQuizGroups(quizId);
        List<Questions> questions = getQuestionsByGroups(groups);

        return QuizzesDTO.StudentQuizResponse.builder()
                .quiz(toQuizResponse(quiz, groups, questions))
                .groups(groups.stream().map(QuizzesDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizzesDTO.QuestionResponse::fromEntity).toList())
                .build();
    }

    @Transactional
    // Tạo quiz mới và đồng thời lưu liên kết lớp, group và question đi kèm.
    public QuizzesDTO.Response create(QuizzesCreateRequest request) {
        Quizzes quiz = Quizzes.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType() != null ? request.getType() : Quizzes.Type.OTHER)
                .part(request.getPart())
                .timeLimit(request.getTimeLimit())
                .status(request.getStatus() != null ? request.getStatus() : Quizzes.Status.active)
                .build();

        Quizzes createdQuiz = quizRepository.save(quiz);
        syncQuizClasses(createdQuiz.getId(), resolveRequestedClassIds(request.getClassIds(), request.getClassId()));
        Map<String, Long> groupIdMap = createOrRefreshQuizGroups(createdQuiz.getId(), request.getGroups(), false);
        createQuizQuestions(request.getQuestions(), groupIdMap);

        List<QuestionGroups> groups = getQuizGroups(createdQuiz.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toQuizResponse(createdQuiz, groups, questions);
    }

    @Transactional
    // Cập nhật metadata cơ bản của quiz hiện có.
    public QuizzesDTO.Response update(Long id, QuizzesCreateRequest request) {
        Quizzes quiz = findQuiz(id);

        if (request.getTitle() != null) quiz.setTitle(request.getTitle());
        if (request.getDescription() != null) quiz.setDescription(request.getDescription());
        if (request.getType() != null) quiz.setType(request.getType());
        if (request.getPart() != null) quiz.setPart(request.getPart());
        if (request.getTimeLimit() != null) quiz.setTimeLimit(request.getTimeLimit());
        if (request.getStatus() != null) quiz.setStatus(request.getStatus());

        Quizzes updatedQuiz = quizRepository.save(quiz);

        if (request.getClassIds() != null || request.getClassId() != null) {
            syncQuizClasses(updatedQuiz.getId(), resolveRequestedClassIds(request.getClassIds(), request.getClassId()));
        }

        if (request.getGroups() != null || request.getQuestions() != null) {
            Map<String, Long> groupIdMap = createOrRefreshQuizGroups(updatedQuiz.getId(), request.getGroups(), true);
            createQuizQuestions(request.getQuestions(), groupIdMap);
        }

        List<QuestionGroups> groups = getQuizGroups(updatedQuiz.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toQuizResponse(updatedQuiz, groups, questions);
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
    // Giáo viên xem bài kiểm tra đã nộp của một học viên trong phạm vi các lớp mình quản lý.
    public List<QuizzesDTO.SubmissionResponse> getTeacherStudentSubmissions(Long userId, String authorizationHeader) {
        Set<Long> teacherClassIds = getTeacherManagedClassIds(authorizationHeader);
        if (teacherClassIds.isEmpty()) {
            return List.of();
        }

        Set<Long> teacherQuizIds = quizClassesRepository.findByClassIdIn(teacherClassIds).stream()
                .map(QuizClasses::getQuizId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return submissionRepository.findByUserId(userId).stream()
                .filter(submission -> teacherQuizIds.contains(submission.getQuizId()))
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

        List<Long> quizIds = quizClassesRepository.findByClassIdIn(classIds).stream()
                .map(QuizClasses::getQuizId)
                .distinct()
                .toList();

        return getQuizzesByIds(quizIds).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy danh sách bài làm của một quiz nếu quiz đó thuộc lớp giáo viên quản lý.
    public List<QuizzesDTO.SubmissionResponse> getTeacherQuizSubmissions(Long quizId, String authorizationHeader) {
        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        Quizzes quiz = findQuiz(quizId);
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
        Quizzes quiz = findQuiz(quizId);
        ensureStudentHasQuizAccess(quiz, userId);
        if (submissionRepository.findFirstByQuizIdAndUserId(quizId, userId).isPresent()) {
            throw new BadRequestException("Bạn đã nộp bài kiểm tra này rồi");
        }

        Map<String, Object> submittedAnswers = request.getAnswers() != null ? request.getAnswers() : Map.of();
        List<Questions> questions = getQuestionsByGroups(getQuizGroups(quizId));
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

            if (isManualGradeQuestion(question)) {
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

        BigDecimal score = autoGradableQuestionCount > 0
                ? BigDecimal.valueOf(correctCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(autoGradableQuestionCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Integer duration = request.getDuration();

        QuizSubmissions submission = QuizSubmissions.builder().build();
        submission.setQuizId(quiz.getId());
        submission.setUserId(userId);
        submission.setAnswersJson(writeAnswersAsJson(normalizedAnswers));
        submission.setStartedAt(duration != null ? LocalDateTime.now().minusSeconds(duration) : null);
        submission.setScore(score);
        submission.setCorrectAnswers(correctCount);
        submission.setTotalQuestions(autoGradableQuestionCount);
        submission.setDuration(duration);
        submission.setStatus("submitted");
        submission.setSubmittedAt(LocalDateTime.now());
        QuizSubmissions savedSubmission = submissionRepository.save(submission);

        return QuizzesDTO.SubmitResultResponse.builder()
                .submissionId(savedSubmission.getId())
                .correct(correctCount)
                .total(autoGradableQuestionCount)
                .score(score.intValue())
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
        Quizzes quiz = findQuiz(submission.getQuizId());
        assertTeacherOwnsQuiz(teacherId, quiz);

        submission.setScore(request.getScore());
        submission.setStatus("graded");
        submission.setGradedAt(LocalDateTime.now());
        return QuizzesDTO.SubmissionResponse.fromEntity(submissionRepository.save(submission));
    }

    // Map quiz entity sang response đồng nhất có kèm lớp học và số lượng câu hỏi.
    private QuizzesDTO.Response toQuizResponse(Quizzes quiz) {
        List<QuestionGroups> groups = getQuizGroups(quiz.getId());
        List<Questions> questions = getQuestionsByGroups(groups);
        return toQuizResponse(quiz, groups, questions);
    }

    // Tái sử dụng dữ liệu đã load sẵn để tránh query lặp lại trong cùng request.
    private QuizzesDTO.Response toQuizResponse(Quizzes quiz, List<QuestionGroups> groups, List<Questions> questions) {
        return QuizzesDTO.Response.fromEntity(quiz, getQuizClassIds(quiz.getId()), (long) questions.size());
    }

    // Lấy danh sách group của quiz theo đúng thứ tự cấu hình.
    private List<QuestionGroups> getQuizGroups(Long quizId) {
        return questionGroupRepository.findByQuizIdOrderByOrderNumAsc(quizId);
    }

    // Lấy danh sách câu hỏi theo group hiện có và giữ thứ tự group -> question để frontend render ổn định.
    private List<Questions> getQuestionsByGroups(List<QuestionGroups> groups) {
        if (groups.isEmpty()) {
            return List.of();
        }

        Map<Long, Integer> groupOrderMap = groups.stream()
                .collect(Collectors.toMap(
                        QuestionGroups::getId,
                        group -> group.getOrderNum() != null ? group.getOrderNum() : 1,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        List<Questions> questions = new ArrayList<>(
                questionRepository.findByGroupIdInOrderByOrderNumAsc(groupOrderMap.keySet())
        );
        questions.sort(Comparator
                .comparing((Questions question) -> groupOrderMap.getOrDefault(question.getGroupId(), Integer.MAX_VALUE))
                .thenComparing(question -> question.getOrderNum() != null ? question.getOrderNum() : Integer.MAX_VALUE)
                .thenComparing(Questions::getId));
        return questions;
    }

    // Ghi đè toàn bộ nhóm câu hỏi của quiz và trả map clientKey -> groupId mới tạo.
    private Map<String, Long> createOrRefreshQuizGroups(Long quizId,
                                                        List<QuizzesCreateRequest.GroupRequest> groupRequests,
                                                        boolean replaceExisting) {
        if (replaceExisting) {
            questionGroupRepository.deleteByQuizId(quizId);
        }

        Map<String, Long> groupIdMap = new HashMap<>();
        if (groupRequests == null) {
            return groupIdMap;
        }

        for (QuizzesCreateRequest.GroupRequest groupRequest : groupRequests) {
            QuestionGroups group = QuestionGroups.builder()
                    .quizId(quizId)
                    .assignId(null)
                    .title(groupRequest.getTitle())
                    .passageText(groupRequest.getPassageText())
                    .imageUrl(groupRequest.getImageUrl())
                    .audioUrl(groupRequest.getAudioUrl())
                    .instructions(groupRequest.getInstructions())
                    .orderNum(groupRequest.getOrderNum() != null ? groupRequest.getOrderNum() : 1)
                    .mockTestId(null)
                    .build();
            QuestionGroups savedGroup = questionGroupRepository.save(group);
            if (groupRequest.getClientKey() != null && !groupRequest.getClientKey().isBlank()) {
                groupIdMap.put(groupRequest.getClientKey(), savedGroup.getId());
            }
        }

        return groupIdMap;
    }

    // Tạo lại danh sách câu hỏi của quiz sau khi group đã được lưu xong.
    private void createQuizQuestions(List<QuizzesCreateRequest.QuestionRequest> questionRequests,
                                     Map<String, Long> groupIdMap) {
        if (questionRequests == null) {
            return;
        }

        for (QuizzesCreateRequest.QuestionRequest questionRequest : questionRequests) {
            Long resolvedGroupId = resolveGroupId(questionRequest.getGroupId(), questionRequest.getGroupKey(), groupIdMap);
            if (resolvedGroupId == null) {
                throw new BadRequestException("Mỗi câu hỏi của quiz phải thuộc một nhóm câu hỏi hợp lệ");
            }

            Questions question = Questions.builder()
                    .groupId(resolvedGroupId)
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

    // Đồng bộ toàn bộ liên kết quiz - lớp theo bảng trung gian quiz_classes.
    private void syncQuizClasses(Long quizId, List<Long> classIds) {
        validateClassIds(classIds);
        quizClassesRepository.deleteByQuizId(quizId);
        if (classIds == null || classIds.isEmpty()) {
            return;
        }

        for (Long classId : classIds) {
            quizClassesRepository.save(QuizClasses.builder()
                    .quizId(quizId)
                    .classId(classId)
                    .build());
        }
    }

    // Gom payload mới/cũ về cùng một danh sách class id duy nhất, loại trùng nhưng giữ thứ tự chọn.
    private List<Long> resolveRequestedClassIds(List<Long> classIds, Long classId) {
        LinkedHashSet<Long> normalizedClassIds = new LinkedHashSet<>();
        if (classIds != null) {
            classIds.stream()
                    .filter(id -> id != null && id > 0)
                    .forEach(normalizedClassIds::add);
        }
        if (classId != null && classId > 0) {
            normalizedClassIds.add(classId);
        }
        return List.copyOf(normalizedClassIds);
    }

    // Chặn trường hợp payload gắn quiz tới lớp không tồn tại.
    private void validateClassIds(List<Long> classIds) {
        if (classIds == null || classIds.isEmpty()) {
            return;
        }

        long existingCount = classesRepository.findAllById(classIds).stream().count();
        if (existingCount != classIds.size()) {
            throw new BadRequestException("Có lớp học không tồn tại trong danh sách được gắn với quiz");
        }
    }

    // Ưu tiên groupId thật, nếu chưa có thì resolve từ groupKey frontend gửi lên trong cùng request.
    private Long resolveGroupId(Long groupId, String groupKey, Map<String, Long> groupIdMap) {
        if (groupId != null) {
            return groupId;
        }
        if (groupKey == null || groupKey.isBlank()) {
            return null;
        }
        return groupIdMap.get(groupKey);
    }

    // Lưu đáp án theo JSON để frontend có thể parse khi xem lại bài làm.
    private String writeAnswersAsJson(Map<String, Object> answers) {
        try {
            return objectMapper.writeValueAsString(answers);
        } catch (JsonProcessingException exception) {
            throw new BadRequestException("Không thể lưu bài làm quiz");
        }
    }

    // Các câu tự luận cần giáo viên chấm tay nên không đưa vào điểm auto-grade.
    private boolean isManualGradeQuestion(Questions question) {
        String questionType = question.getQuestionType() != null
                ? question.getQuestionType().trim().toLowerCase()
                : "";
        return "writing".equals(questionType) || "essay".equals(questionType);
    }

    // Lấy danh sách class id mà quiz hiện đang liên kết.
    private List<Long> getQuizClassIds(Long quizId) {
        return quizClassesRepository.findByQuizId(quizId).stream()
                .map(QuizClasses::getClassId)
                .distinct()
                .toList();
    }

    // Tìm quiz hoặc ném lỗi 404.
    private Quizzes findQuiz(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quiz"));
    }

    // Tải quiz theo danh sách id nhưng vẫn giữ thứ tự id đầu vào.
    private List<Quizzes> getQuizzesByIds(Collection<Long> quizIds) {
        if (quizIds == null || quizIds.isEmpty()) {
            return List.of();
        }

        Map<Long, Quizzes> quizMap = quizRepository.findAllById(quizIds).stream()
                .collect(Collectors.toMap(Quizzes::getId, Function.identity()));

        return quizIds.stream()
                .distinct()
                .map(quizMap::get)
                .filter(quiz -> quiz != null)
                .toList();
    }

    // Đảm bảo giáo viên chỉ thao tác với bài kiểm tra được gắn toàn bộ cho các lớp mình quản lý.
    private void assertTeacherOwnsQuiz(Long teacherId, Quizzes quiz) {
        List<Long> classIds = getQuizClassIds(quiz.getId());
        if (classIds.isEmpty()) {
            throw new ForbiddenException("Bài kiểm tra chưa gắn với lớp học");
        }

        List<Classes> linkedClasses = classesRepository.findAllById(classIds);
        boolean ownsAllClasses = linkedClasses.size() == classIds.size()
                && linkedClasses.stream().allMatch(classRoom -> teacherId.equals(classRoom.getTeacherId()));
        if (!ownsAllClasses) {
            throw new ForbiddenException("Bạn không có quyền thao tác với bài kiểm tra này");
        }
    }

    // Lấy danh sách lớp của giáo viên hiện tại để dùng cho các API drill-down ở teacher.
    private Set<Long> getTeacherManagedClassIds(String authorizationHeader) {
        Integer currentRoleId = currentUserService.extractRoleId(authorizationHeader);
        if (!Integer.valueOf(2).equals(currentRoleId)) {
            throw new ForbiddenException("Bạn không có quyền xem kết quả của học viên này");
        }

        Long teacherId = currentUserService.extractUserId(authorizationHeader);
        return classesRepository.findByTeacherId(teacherId).stream()
                .map(Classes::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
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

    // Học viên chỉ được xem/làm quiz thuộc ít nhất một lớp mình đang hoặc đã học.
    private void ensureStudentHasQuizAccess(Quizzes quiz, Long userId) {
        Set<Long> quizClassIds = new LinkedHashSet<>(getQuizClassIds(quiz.getId()));
        if (quizClassIds.isEmpty()) {
            throw new ForbiddenException("Bài quiz này chưa gắn với lớp học");
        }

        boolean hasAccess = enrollmentsRepository.findByUserId(userId).stream()
                .anyMatch(enrollment -> quizClassIds.contains(enrollment.getClassId())
                        && (enrollment.getStatus() == Enrollments.Status.approved
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
