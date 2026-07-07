package com.newskyenglish.dto.assignments;

import com.newskyenglish.model.AssignmentSubmissions;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response cho bài nộp của học viên.
public class AssignmentSubmissionsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubmitRequest {
        private String content;
        private String answersJson;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GradeRequest {
        @PositiveOrZero(message = "Điểm không được âm")
        private BigDecimal score;

        private String comment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long assignId;
        private Long userId;
        private String content;
        private String answersJson;
        private BigDecimal score;
        private String comment;
        private AssignmentSubmissions.Status status;
        private LocalDateTime submittedAt;
        private LocalDateTime updatedAt;

        // Chuyển entity bài nộp sang response DTO cho teacher/student.
        public static Response fromEntity(AssignmentSubmissions submission) {
            return Response.builder()
                    .id(submission.getId())
                    .assignId(submission.getAssignId())
                    .userId(submission.getUserId())
                    .content(submission.getContent())
                    .answersJson(submission.getAnswersJson())
                    .score(submission.getScore())
                    .comment(submission.getComment())
                    .status(submission.getStatus())
                    .submittedAt(submission.getSubmittedAt())
                    .updatedAt(submission.getUpdatedAt())
                    .build();
        }
    }
}

