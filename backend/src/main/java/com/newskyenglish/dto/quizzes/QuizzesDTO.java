package com.newskyenglish.dto.quizzes;

import com.newskyenglish.model.Questions;
import com.newskyenglish.model.QuestionGroups;
import com.newskyenglish.model.Quizzes;
import com.newskyenglish.model.QuizSubmissions;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

// Gom các response trả về cho màn quản lý quiz và màn học viên làm bài.
public class QuizzesDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private Quizzes.Type type;
        private String part;
        private Integer timeLimit;
        private Quizzes.Status status;
        private Long classId;
        private List<Long> classIds;
        private Long questionCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Dùng cho danh sách quiz và các màn tổng quan khi chưa cần đếm câu hỏi.
        public static Response fromEntity(Quizzes quiz) {
            return fromEntity(quiz, List.of(), null);
        }

        // Dùng cho danh sách quiz có bổ sung metadata như số lượng câu hỏi.
        public static Response fromEntity(Quizzes quiz, List<Long> classIds, Long questionCount) {
            List<Long> normalizedClassIds = classIds != null ? classIds : Collections.emptyList();
            return Response.builder()
                    .id(quiz.getId())
                    .title(quiz.getTitle())
                    .description(quiz.getDescription())
                    .type(quiz.getType())
                    .part(quiz.getPart())
                    .timeLimit(quiz.getTimeLimit())
                    .status(quiz.getStatus())
                    .classId(normalizedClassIds.isEmpty() ? null : normalizedClassIds.get(0))
                    .classIds(normalizedClassIds)
                    .questionCount(questionCount)
                    .createdAt(quiz.getCreatedAt())
                    .updatedAt(quiz.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupResponse {
        private Long id;
        private Long quizId;
        private String title;
        private String passageText;
        private String imageUrl;
        private String audioUrl;
        private String instructions;
        private Integer orderNum;

        // Dùng cho phần group/passage của quiz.
        public static GroupResponse fromEntity(QuestionGroups group) {
            return GroupResponse.builder()
                    .id(group.getId())
                    .quizId(group.getQuizId())
                    .title(group.getTitle())
                    .passageText(group.getPassageText())
                    .imageUrl(group.getImageUrl())
                    .audioUrl(group.getAudioUrl())
                    .instructions(group.getInstructions())
                    .orderNum(group.getOrderNum())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionResponse {
        private Long id;
        private Long groupId;
        private String questionType;
        private String content;
        private String imageUrl;
        private String audioUrl;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private Integer orderNum;

        // Dùng cho màn học viên làm quiz, không lộ đáp án đúng.
        public static QuestionResponse fromEntity(Questions question) {
            return QuestionResponse.builder()
                    .id(question.getId())
                    .groupId(question.getGroupId())
                    .questionType(question.getQuestionType())
                    .content(question.getContent())
                    .imageUrl(question.getImageUrl())
                    .audioUrl(question.getAudioUrl())
                    .optionA(question.getOptionA())
                    .optionB(question.getOptionB())
                    .optionC(question.getOptionC())
                    .optionD(question.getOptionD())
                    .orderNum(question.getOrderNum())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionDetailResponse {
        private Long id;
        private Long groupId;
        private String questionType;
        private String content;
        private String imageUrl;
        private String audioUrl;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctAnswer;
        private String explanation;
        private Integer orderNum;

        // Dùng cho màn quản trị cần xem đầy đủ nội dung và đáp án.
        public static QuestionDetailResponse fromEntity(Questions question) {
            return QuestionDetailResponse.builder()
                    .id(question.getId())
                    .groupId(question.getGroupId())
                    .questionType(question.getQuestionType())
                    .content(question.getContent())
                    .imageUrl(question.getImageUrl())
                    .audioUrl(question.getAudioUrl())
                    .optionA(question.getOptionA())
                    .optionB(question.getOptionB())
                    .optionC(question.getOptionC())
                    .optionD(question.getOptionD())
                    .correctAnswer(question.getCorrectAnswer())
                    .explanation(question.getExplanation())
                    .orderNum(question.getOrderNum())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FullResponse {
        // Metadata chính của bài quiz.
        private Response quiz;
        // Các passage/group để frontend render theo block.
        private List<GroupResponse> groups;
        // Danh sách câu hỏi đầy đủ, bao gồm cả đáp án cho admin.
        private List<QuestionDetailResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentQuizResponse {
        // Metadata chính của bài quiz.
        private Response quiz;
        // Các passage/group để student nhìn theo cụm câu hỏi.
        private List<GroupResponse> groups;
        // Danh sách câu hỏi đã ẩn đáp án đúng.
        private List<QuestionResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmissionResponse {
        private Long id;
        private Long quizId;
        private Long userId;
        private String answersJson;
        private BigDecimal score;
        private LocalDateTime startedAt;
        private LocalDateTime gradedAt;
        private Integer duration;
        private Integer correctAnswers;
        private Integer totalQuestions;
        private String status;
        private LocalDateTime submittedAt;

        // Dùng cho kết quả quiz ở teacher/admin/student.
        public static SubmissionResponse fromEntity(QuizSubmissions submission) {
            return SubmissionResponse.builder()
                    .id(submission.getId())
                    .quizId(submission.getQuizId())
                    .userId(submission.getUserId())
                    .answersJson(submission.getAnswersJson())
                    .score(submission.getScore())
                    .startedAt(submission.getStartedAt())
                    .gradedAt(submission.getGradedAt())
                    .duration(submission.getDuration())
                    .correctAnswers(submission.getCorrectAnswers())
                    .totalQuestions(submission.getTotalQuestions())
                    .status(submission.getStatus())
                    .submittedAt(submission.getSubmittedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitRequest {
        // Map đáp án theo questionId để backend chấm bài linh hoạt.
        @NotNull(message = "Thiếu danh sách đáp án")
        private Map<String, Object> answers;

        // Tổng số giây học viên đã làm bài trước khi nộp.
        private Integer duration;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitResultResponse {
        // Id submission vừa được lưu để frontend có thể truy vết kết quả.
        private Long submissionId;
        // Số câu trắc nghiệm/fill blank được chấm đúng tự động.
        private Integer correct;
        // Tổng số câu có thể auto-grade.
        private Integer total;
        // Điểm quy đổi về thang 100.
        private Integer score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GradeSubmissionRequest {
        // Giáo viên nhập điểm cuối cùng cho bài làm quiz.
        @NotNull(message = "Thiếu điểm bài làm")
        private BigDecimal score;
    }
}

