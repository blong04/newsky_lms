package com.newskyenglish.dto.officialexamresults;

import com.newskyenglish.dto.courses.CoursesDTO;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.OfficialExamResults;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// Gom request/response cho điểm thi chính thức sau khóa học.
public class OfficialExamResultsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "Thiếu courseId")
        private Long courseId;

        private Courses.ExamType examType;

        @NotNull(message = "Thiếu điểm thi")
        @Positive(message = "Điểm thi phải lớn hơn 0")
        private BigDecimal score;

        @NotNull(message = "Thiếu ngày thi")
        private LocalDate examDate;

        private String certificateUrl;
        private String note;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private Long courseId;
        private String courseTitle;
        private Courses.ExamType examType;
        private BigDecimal score;
        private LocalDate examDate;
        private String certificateUrl;
        private String note;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response fromEntity(OfficialExamResults result, Courses course) {
            return Response.builder()
                    .id(result.getId())
                    .userId(result.getUserId())
                    .courseId(result.getCourseId())
                    .courseTitle(course != null ? course.getTitle() : null)
                    .examType(result.getExamType())
                    .score(result.getScore())
                    .examDate(result.getExamDate())
                    .certificateUrl(result.getCertificateUrl())
                    .note(result.getNote())
                    .createdAt(result.getCreatedAt())
                    .updatedAt(result.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateResultResponse {
        private Response result;
        private boolean eligibleForFreeRetake;
        private Long sourceEnrollmentId;
        private List<CoursesDTO.RecommendationItem> nextCourseSuggestions;
    }
}
