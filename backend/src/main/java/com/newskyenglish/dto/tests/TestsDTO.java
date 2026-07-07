package com.newskyenglish.dto.tests;

import com.newskyenglish.model.TestSubmissions;
import com.newskyenglish.model.QuestionGroups;
import com.newskyenglish.model.Questions;
import com.newskyenglish.model.Tests;
import jakarta.validation.constraints.NotBlank;
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

// Gom request/response cho bài test full form và lịch sử nộp test.
public class TestsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        // classId giữ lại để tương thích payload cũ khi chỉ gắn một lớp.
        private Long classId;
        // classIds là danh sách lớp được gắn với bài thi thử trong schema mới.
        private List<Long> classIds;

        @NotBlank(message = "Tiêu đề test không được để trống")
        private String title;

        private String description;
        private String testType;
        private String examType;
        private String examPart;
        private String skillType;
        private Integer durationMinutes;
        private BigDecimal totalScore;
        private Integer attemptsAllowed;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private List<GroupRequest> groups;
        private List<QuestionRequest> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long classId;
        private List<Long> classIds;
        private String title;
        private String description;
        private String testType;
        private String examType;
        private String examPart;
        private String skillType;
        private Integer durationMinutes;
        private BigDecimal totalScore;
        private Integer attemptsAllowed;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private List<GroupRequest> groups;
        private List<QuestionRequest> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupRequest {
        private String clientKey;
        private String title;
        private String passageText;
        private String imageUrl;
        private String audioUrl;
        private String instructions;
        private Integer orderNum;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuestionRequest {
        private Long groupId;
        private String groupKey;
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
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long classId;
        private List<Long> classIds;
        private String title;
        private String description;
        private String testType;
        private String examType;
        private String examPart;
        private String skillType;
        private Integer durationMinutes;
        private BigDecimal totalScore;
        private Integer attemptsAllowed;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(Tests test, List<Long> classIds) {
            List<Long> normalizedClassIds = classIds != null ? classIds : Collections.emptyList();
            return Response.builder()
                    .id(test.getId())
                    .classId(normalizedClassIds.isEmpty() ? null : normalizedClassIds.get(0))
                    .classIds(normalizedClassIds)
                    .title(test.getTitle())
                    .description(test.getDescription())
                    .testType(test.getTestType())
                    .examType(test.getExamType())
                    .examPart(test.getExamPart())
                    .skillType(test.getSkillType())
                    .durationMinutes(test.getDurationMinutes())
                    .totalScore(test.getTotalScore())
                    .attemptsAllowed(test.getAttemptsAllowed())
                    .startTime(test.getStartTime())
                    .endTime(test.getEndTime())
                    .status(test.getStatus())
                    .createdAt(test.getCreatedAt())
                    .updatedAt(test.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupResponse {
        private Long id;
        private Long testId;
        private String title;
        private String passageText;
        private String imageUrl;
        private String audioUrl;
        private String instructions;
        private Integer orderNum;

        public static GroupResponse fromEntity(QuestionGroups group) {
            return GroupResponse.builder()
                    .id(group.getId())
                    .testId(group.getMockTestId())
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
    public static class SubmissionResponse {
        private Long id;
        private Long testId;
        private Long userId;
        private String answersJson;
        private LocalDateTime startedAt;
        private LocalDateTime submittedAt;
        private Integer durationSeconds;
        private BigDecimal totalScore;
        private Integer correctAnswers;
        private Integer totalQuestions;
        private Integer attemptNumber;
        private String status;
        private LocalDateTime createdAt;

        public static SubmissionResponse fromEntity(TestSubmissions submission) {
            return SubmissionResponse.builder()
                    .id(submission.getId())
                    .testId(submission.getMockTestId())
                    .userId(submission.getUserId())
                    .answersJson(submission.getAnswersJson())
                    .startedAt(submission.getStartedAt())
                    .submittedAt(submission.getSubmittedAt())
                    .durationSeconds(submission.getDurationSeconds())
                    .totalScore(submission.getTotalScore())
                    .correctAnswers(submission.getCorrectAnswers())
                    .totalQuestions(submission.getTotalQuestions())
                    .attemptNumber(submission.getAttemptNumber())
                    .status(submission.getStatus())
                    .createdAt(submission.getCreatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FullResponse {
        private Response test;
        private List<GroupResponse> groups;
        private List<QuestionDetailResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentTestResponse {
        private Response test;
        private List<GroupResponse> groups;
        private List<QuestionResponse> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitRequest {
        @NotNull(message = "Thiếu danh sách đáp án")
        private Map<String, Object> answers;

        private Integer durationSeconds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitResultResponse {
        private Long submissionId;
        private Integer correct;
        private Integer total;
        private BigDecimal score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GradeSubmissionRequest {
        @NotNull(message = "Thiếu điểm bài làm")
        private BigDecimal totalScore;
    }
}
