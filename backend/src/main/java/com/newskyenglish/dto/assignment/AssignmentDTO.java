package com.newskyenglish.dto.assignment;

import com.newskyenglish.model.Assignment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response cho thực thể bài tập.
public class AssignmentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private Long classId;

        @NotBlank(message = "Tiêu đề bài tập không được để trống")
        private String title;

        private String description;
        private Assignment.Type type;
        private Assignment.ExamType examType;
        private String examPart;
        private String part;
        private LocalDateTime deadline;

        @PositiveOrZero(message = "Điểm tối đa không được âm")
        private BigDecimal maxScore;

        private Assignment.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long classId;
        private String title;
        private String description;
        private Assignment.Type type;
        private Assignment.ExamType examType;
        private String examPart;
        private String part;
        private LocalDateTime deadline;

        @PositiveOrZero(message = "Điểm tối đa không được âm")
        private BigDecimal maxScore;

        private Assignment.Status status;
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
        private Assignment.Type type;
        private Assignment.ExamType examType;
        private String examPart;
        private String part;
        private LocalDateTime deadline;
        private BigDecimal maxScore;
        private Assignment.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Chuyển entity assignment sang response DTO thống nhất.
        public static Response fromEntity(Assignment assignment) {
            return Response.builder()
                    .id(assignment.getId())
                    .classId(assignment.getClassId())
                    .title(assignment.getTitle())
                    .description(assignment.getDescription())
                    .type(assignment.getType())
                    .examType(assignment.getExamType())
                    .examPart(assignment.getExamPart())
                    .part(assignment.getPart())
                    .deadline(assignment.getDeadline())
                    .maxScore(assignment.getMaxScore())
                    .status(assignment.getStatus())
                    .createdAt(assignment.getCreatedAt())
                    .updatedAt(assignment.getUpdatedAt())
                    .build();
        }
    }
}
