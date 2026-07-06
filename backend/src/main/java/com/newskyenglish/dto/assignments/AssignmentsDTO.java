package com.newskyenglish.dto.assignments;

import com.newskyenglish.model.Assignments;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response cho thực thể bài tập.
public class AssignmentsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        private Long classId;

        @NotBlank(message = "Tiêu đề bài tập không được để trống")
        private String title;

        private String description;
        private String type;
        private LocalDateTime deadline;

        @PositiveOrZero(message = "Điểm tối đa không được âm")
        private BigDecimal maxScore;

        private Assignments.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long classId;
        private String title;
        private String description;
        private String type;
        private LocalDateTime deadline;

        @PositiveOrZero(message = "Điểm tối đa không được âm")
        private BigDecimal maxScore;

        private Assignments.Status status;
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
        private String type;
        private LocalDateTime deadline;
        private BigDecimal maxScore;
        private Assignments.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Chuyển entity assignment sang response DTO thống nhất.
        public static Response fromEntity(Assignments assignment) {
            return Response.builder()
                    .id(assignment.getId())
                    .classId(assignment.getClassId())
                    .title(assignment.getTitle())
                    .description(assignment.getDescription())
                    .type(assignment.getType())
                    .deadline(assignment.getDeadline())
                    .maxScore(assignment.getMaxScore())
                    .status(assignment.getStatus())
                    .createdAt(assignment.getCreatedAt())
                    .updatedAt(assignment.getUpdatedAt())
                    .build();
        }
    }
}

