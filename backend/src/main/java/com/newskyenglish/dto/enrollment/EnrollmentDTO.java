package com.newskyenglish.dto.enrollment;

import com.newskyenglish.model.ClassRoom;
import com.newskyenglish.model.Course;
import com.newskyenglish.model.Enrollment;
import com.newskyenglish.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// Gom request/response cho luồng đăng ký khóa học và theo dõi enrollment.
public class EnrollmentDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentEnrollRequest {
        @NotNull(message = "Thiếu courseId")
        private Long courseId;

        @NotNull(message = "Thiếu classId")
        private Long classId;

        private Boolean paid;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateStatusRequest {
        @NotBlank(message = "Thiếu trạng thái enrollment")
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private Long courseId;
        private Long classId;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private Long approvedBy;
        private Boolean paid;
        private Enrollment.Status status;
        private BigDecimal progress;
        private LocalDateTime completedDate;

        // Dùng cho các endpoint enrollment cơ bản chưa cần join thêm dữ liệu.
        public static Response fromEntity(Enrollment enrollment) {
            return Response.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .approvedBy(enrollment.getApprovedBy())
                    .paid(enrollment.getPaid())
                    .status(enrollment.getStatus())
                    .progress(enrollment.getProgress())
                    .completedDate(enrollment.getCompletedDate())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminDetailResponse {
        private Long id;
        private Long userId;
        private Long courseId;
        private Long classId;
        private Enrollment.Status status;
        private BigDecimal progress;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private Boolean paid;
        private String userName;
        private String userEmail;
        private String courseName;
        private Course.ExamType examType;
        private String className;

        // Dùng cho màn admin enrollments cần hiển thị thông tin đã join sẵn.
        public static AdminDetailResponse fromEntity(Enrollment enrollment,
                                                     User user,
                                                     Course course,
                                                     ClassRoom classRoom) {
            return AdminDetailResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .progress(enrollment.getProgress())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .paid(enrollment.getPaid())
                    .userName(user != null ? user.getName() : null)
                    .userEmail(user != null ? user.getEmail() : null)
                    .courseName(course != null ? course.getTitle() : null)
                    .examType(course != null ? course.getExamType() : null)
                    .className(classRoom != null ? classRoom.getName() : null)
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentResponse {
        private Long id;
        private Long userId;
        private Long courseId;
        private Long classId;
        private Enrollment.Status status;
        private BigDecimal progress;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private Boolean paid;
        private String courseName;
        private Course.ExamType examType;
        private String className;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer maxStudents;
        private Integer currentStudents;

        // Dùng cho dashboard và catalog của học viên với thông tin course/class đã enrich.
        public static StudentResponse fromEntity(Enrollment enrollment,
                                                 Course course,
                                                 ClassRoom classRoom,
                                                 Integer currentStudents) {
            return StudentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .progress(enrollment.getProgress())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .paid(enrollment.getPaid())
                    .courseName(course != null ? course.getTitle() : null)
                    .examType(course != null ? course.getExamType() : null)
                    .className(classRoom != null ? classRoom.getName() : null)
                    .startDate(classRoom != null ? classRoom.getStartDate() : null)
                    .endDate(classRoom != null ? classRoom.getEndDate() : null)
                    .maxStudents(classRoom != null ? classRoom.getMaxStudents() : null)
                    .currentStudents(currentStudents)
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeacherStudentResponse {
        private Long id;
        private Long userId;
        private Long courseId;
        private Long classId;
        private Enrollment.Status status;
        private BigDecimal progress;
        private Boolean paid;
        private LocalDateTime enrollDate;
        private String userName;
        private String userEmail;
        private String className;
        private String courseName;
        private Course.ExamType examType;

        // Dùng cho màn giáo viên xem học viên theo lớp với dữ liệu đã join sẵn.
        public static TeacherStudentResponse fromEntity(Enrollment enrollment,
                                                        User user,
                                                        Course course,
                                                        ClassRoom classRoom) {
            return TeacherStudentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(enrollment.getCourseId())
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .progress(enrollment.getProgress())
                    .paid(enrollment.getPaid())
                    .enrollDate(enrollment.getEnrollDate())
                    .userName(user != null ? user.getName() : null)
                    .userEmail(user != null ? user.getEmail() : null)
                    .className(classRoom != null ? classRoom.getName() : null)
                    .courseName(course != null ? course.getTitle() : null)
                    .examType(course != null ? course.getExamType() : null)
                    .build();
        }
    }
}
