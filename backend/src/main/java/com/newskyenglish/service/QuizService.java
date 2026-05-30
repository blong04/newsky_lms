package com.newskyenglish.service;

import com.newskyenglish.dto.quiz.QuizCreateRequest;
import com.newskyenglish.dto.quiz.QuizDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.Question;
import com.newskyenglish.model.QuestionGroup;
import com.newskyenglish.model.Quiz;
import com.newskyenglish.repository.QuestionGroupRepository;
import com.newskyenglish.repository.QuestionRepository;
import com.newskyenglish.repository.QuizRepository;
import com.newskyenglish.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
// Quản lý quiz, nhóm câu hỏi, câu hỏi và lịch sử nộp bài liên quan.
public class QuizService {

    // Repository layer phục vụ CRUD quiz, question và submission liên quan.
    private final QuizRepository quizRepository;
    private final QuestionGroupRepository questionGroupRepository;
    private final QuestionRepository questionRepository;
    private final SubmissionRepository submissionRepository;

    @Transactional(readOnly = true)
    // Lấy toàn bộ quiz để hiển thị ở admin và student.
    public List<QuizDTO.Response> getAll() {
        return quizRepository.findAll().stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy quiz theo lớp học để admin/teacher/student chỉ nhìn đúng bài kiểm tra liên quan.
    public List<QuizDTO.Response> getByClass(Long classId) {
        return quizRepository.findByClassId(classId).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lọc quiz theo loại chứng chỉ như IELTS hoặc TOEIC.
    public List<QuizDTO.Response> getByType(Quiz.ExamType examType) {
        return quizRepository.findByExamType(examType).stream()
                .map(this::toQuizResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy full dữ liệu quiz gồm metadata, group và question.
    public QuizDTO.FullResponse getFullQuiz(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quiz"));
        List<QuestionGroup> groups = questionGroupRepository.findByQuizIdOrderByOrderNumAsc(id);
        List<Question> questions = questionRepository.findByQuizIdOrderByOrderNumAsc(id);

        return QuizDTO.FullResponse.builder()
                .quiz(toQuizResponse(quiz, (long) questions.size()))
                .groups(groups.stream().map(QuizDTO.GroupResponse::fromEntity).toList())
                .questions(questions.stream().map(QuizDTO.QuestionDetailResponse::fromEntity).toList())
                .build();
    }

    @Transactional
    // Tạo quiz mới và đồng thời lưu các group/question đi kèm.
    public QuizDTO.Response create(QuizCreateRequest request) {
        // Tạo bản ghi quiz chính trước để lấy id gắn cho group/question con.
        Quiz quiz = Quiz.builder()
                .classId(request.getClassId())
                .title(request.getTitle())
                .type(request.getType() != null ? request.getType() : Quiz.QuizType.mcq)
                .examType(request.getExamType() != null ? request.getExamType() : Quiz.ExamType.OTHER)
                .examPart(request.getExamPart())
                .passageText(request.getPassageText())
                .audioUrl(request.getAudioUrl())
                .instructions(request.getInstructions())
                .timeLimit(request.getTimeLimit())
                .build();

        Quiz createdQuiz = quizRepository.save(quiz);

        if (request.getGroups() != null) {
            for (QuizCreateRequest.GroupRequest groupRequest : request.getGroups()) {
                QuestionGroup group = QuestionGroup.builder()
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
            for (QuizCreateRequest.QuestionRequest questionRequest : request.getQuestions()) {
                Question question = Question.builder()
                        .quizId(createdQuiz.getId())
                        .groupId(questionRequest.getGroupId())
                        .partNumber(questionRequest.getPartNumber())
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
                        .scoreWeight(questionRequest.getScoreWeight())
                        .build();
                questionRepository.save(question);
            }
        }

        return toQuizResponse(createdQuiz, request.getQuestions() != null ? (long) request.getQuestions().size() : 0L);
    }

    @Transactional
    // Cập nhật metadata cơ bản của quiz hiện có.
    public QuizDTO.Response update(Long id, QuizCreateRequest request) {
        Quiz quiz = quizRepository.findById(id)
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

        Quiz updatedQuiz = quizRepository.save(quiz);
        if (request.getGroups() != null) {
            questionGroupRepository.deleteByQuizId(id);
            for (QuizCreateRequest.GroupRequest groupRequest : request.getGroups()) {
                QuestionGroup group = QuestionGroup.builder()
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
            for (QuizCreateRequest.QuestionRequest questionRequest : request.getQuestions()) {
                Question question = Question.builder()
                        .quizId(updatedQuiz.getId())
                        .groupId(questionRequest.getGroupId())
                        .partNumber(questionRequest.getPartNumber())
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
                        .scoreWeight(questionRequest.getScoreWeight())
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
    public List<QuizDTO.SubmissionResponse> getQuizSubmissions(Long id) {
        return submissionRepository.findByQuizId(id).stream()
                .map(QuizDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    // Lấy lịch sử submission quiz của một user.
    public List<QuizDTO.SubmissionResponse> getUserSubmissions(Long userId) {
        return submissionRepository.findByUserId(userId).stream()
                .map(QuizDTO.SubmissionResponse::fromEntity)
                .toList();
    }

    // Map quiz entity sang response đồng nhất có kèm số lượng câu hỏi.
    private QuizDTO.Response toQuizResponse(Quiz quiz) {
        return toQuizResponse(quiz, questionRepository.countByQuizId(quiz.getId()));
    }

    // Cho phép tái sử dụng khi service đã có sẵn questionCount từ truy vấn trước đó.
    private QuizDTO.Response toQuizResponse(Quiz quiz, Long questionCount) {
        return QuizDTO.Response.fromEntity(quiz, questionCount);
    }
}
