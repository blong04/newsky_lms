package com.newskyenglish.dto.courses;

import com.newskyenglish.model.Courses;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Gom request/response cho khóa học.
public class CoursesDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề khóa học không được để trống")
        private String title;

        private String description;

        @PositiveOrZero(message = "Học phí không được âm")
        private BigDecimal price;
        private Courses.Level level;
        private Courses.ExamType examType;
        private Courses.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private String title;
        private String description;

        @PositiveOrZero(message = "Học phí không được âm")
        private BigDecimal price;
        private Courses.Level level;
        private Courses.ExamType examType;
        private Courses.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private BigDecimal price;
        private Courses.Level level;
        private Courses.ExamType examType;
        private Courses.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Chuyển entity Courses sang response an toàn cho API.
        public static Response fromEntity(Courses course) {
            return Response.builder()
                    .id(course.getId())
                    .title(course.getTitle())
                    .description(course.getDescription())
                    .price(course.getPrice())
                    .level(course.getLevel())
                    .examType(course.getExamType())
                    .status(course.getStatus())
                    .createdAt(course.getCreatedAt())
                    .updatedAt(course.getUpdatedAt())
                    .build();
        }
    }
}

