package com.newskyenglish.dto.tests;

import com.newskyenglish.model.TestSubmissions;
import com.newskyenglish.model.Tests;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response cho bài test full form và lịch sử nộp test.
public class TestsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private Long classId;

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
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long classId;
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
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long classId;
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

        public static Response fromEntity(Tests test) {
            return Response.builder()
                    .id(test.getId())
                    .classId(test.getClassId())
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
    public static class SubmissionResponse {
        private Long id;
        private Long testId;
        private Long userId;
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
                    .testId(submission.getTestId())
                    .userId(submission.getUserId())
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
}
