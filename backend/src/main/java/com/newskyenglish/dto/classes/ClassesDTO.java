package com.newskyenglish.dto.classes;

import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Gom request/response cho lớp học để controller không trả thẳng entity.
public class ClassesDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "Khóa học không được để trống")
        private Long courseId;

        private Long teacherId;

        @NotBlank(message = "Tên lớp không được để trống")
        private String name;

        private String description;

        @Min(value = 1, message = "Sĩ số tối đa phải lớn hơn 0")
        private Integer maxStudents;
        private LocalDate startDate;
        private LocalDate endDate;
        private Classes.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        private Long courseId;
        private Long teacherId;
        private String name;
        private String description;

        @Min(value = 1, message = "Sĩ số tối đa phải lớn hơn 0")
        private Integer maxStudents;
        private LocalDate startDate;
        private LocalDate endDate;
        private Classes.Status status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long courseId;
        private Long teacherId;
        private String name;
        private String description;
        private Integer maxStudents;
        private Integer currentStudents;
        private LocalDate startDate;
        private LocalDate endDate;
        private Classes.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String teacherName;
        private String courseName;
        private Courses.ExamType examType;

        // Chuyển entity lớp học sang response, có thể kèm thêm tên giáo viên.
        public static Response fromEntity(Classes classRoom, Integer currentStudents, String teacherName) {
            return fromEntity(classRoom, currentStudents, teacherName, null, null);
        }

        // Dùng cho các màn cần hiển thị thêm tên khóa học và loại chứng chỉ.
        public static Response fromEntity(Classes classRoom,
                                          Integer currentStudents,
                                          String teacherName,
                                          String courseName,
                                          Courses.ExamType examType) {
            return Response.builder()
                    .id(classRoom.getId())
                    .courseId(classRoom.getCourseId())
                    .teacherId(classRoom.getTeacherId())
                    .name(classRoom.getName())
                    .description(classRoom.getDescription())
                    .maxStudents(classRoom.getMaxStudents())
                    .currentStudents(currentStudents)
                    .startDate(classRoom.getStartDate())
                    .endDate(classRoom.getEndDate())
                    .status(classRoom.getStatus())
                    .createdAt(classRoom.getCreatedAt())
                    .updatedAt(classRoom.getUpdatedAt())
                    .teacherName(teacherName)
                    .courseName(courseName)
                    .examType(examType)
                    .build();
        }

        // Dùng cho các endpoint không cần enrich thêm dữ liệu giáo viên.
        public static Response fromEntity(Classes classRoom, Integer currentStudents) {
            return fromEntity(classRoom, currentStudents, null);
        }
    }
}

