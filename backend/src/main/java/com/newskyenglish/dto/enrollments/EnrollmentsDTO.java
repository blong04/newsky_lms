package com.newskyenglish.dto.enrollments;

import com.newskyenglish.model.Classes;
import com.newskyenglish.model.Courses;
import com.newskyenglish.model.Enrollments;
import com.newskyenglish.model.Users;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

// Gom request/response cho luồng đăng ký khóa học và theo dõi enrollment.
public class EnrollmentsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentEnrollRequest {
        @NotNull(message = "Thiếu courseId")
        private Long courseId;

        @NotNull(message = "Thiếu classId")
        private Long classId;

        @NotBlank(message = "Thiếu phương thức thanh toán")
        private String paymentMethod;

        // FE vẫn có view mô phỏng thanh toán nên giữ cờ này để backend tạo payment phù hợp.
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
        private String paymentStatus;
        private String paymentMethod;
        private Enrollments.Status status;

        // Dùng cho các endpoint enrollment cơ bản chưa cần join thêm dữ liệu.
        public static Response fromEntity(Enrollments enrollment,
                                          Long courseId,
                                          Boolean paid,
                                          String paymentStatus,
                                          String paymentMethod) {
            return Response.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(courseId)
                    .classId(enrollment.getClassId())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .approvedBy(enrollment.getApprovedBy())
                    .paid(paid)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
                    .status(enrollment.getStatus())
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
        private Enrollments.Status status;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private Boolean paid;
        private String paymentStatus;
        private String paymentMethod;
        private String userName;
        private String userEmail;
        private String courseName;
        private Courses.ExamType examType;
        private String className;

        // Dùng cho màn admin enrollments cần hiển thị thông tin đã join sẵn.
        public static AdminDetailResponse fromEntity(Enrollments enrollment,
                                                     Users user,
                                                     Courses course,
                                                     Classes classRoom,
                                                     Boolean paid,
                                                     String paymentStatus,
                                                     String paymentMethod) {
            return AdminDetailResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(course != null ? course.getId() : null)
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .paid(paid)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
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
        private Enrollments.Status status;
        private LocalDateTime enrollDate;
        private LocalDateTime approvedDate;
        private Boolean paid;
        private String paymentStatus;
        private String paymentMethod;
        private String courseName;
        private Courses.ExamType examType;
        private String className;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer maxStudents;
        private Integer currentStudents;

        // Dùng cho dashboard và catalog của học viên với thông tin course/class đã enrich.
        public static StudentResponse fromEntity(Enrollments enrollment,
                                                 Courses course,
                                                 Classes classRoom,
                                                 Integer currentStudents,
                                                 Boolean paid,
                                                 String paymentStatus,
                                                 String paymentMethod) {
            return StudentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(course != null ? course.getId() : null)
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .enrollDate(enrollment.getEnrollDate())
                    .approvedDate(enrollment.getApprovedDate())
                    .paid(paid)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
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
        private Enrollments.Status status;
        private Boolean paid;
        private String paymentStatus;
        private String paymentMethod;
        private LocalDateTime enrollDate;
        private String userName;
        private String userEmail;
        private String className;
        private String courseName;
        private Courses.ExamType examType;

        // Dùng cho màn giáo viên xem học viên theo lớp với dữ liệu đã join sẵn.
        public static TeacherStudentResponse fromEntity(Enrollments enrollment,
                                                        Users user,
                                                        Courses course,
                                                        Classes classRoom,
                                                        Boolean paid,
                                                        String paymentStatus,
                                                        String paymentMethod) {
            return TeacherStudentResponse.builder()
                    .id(enrollment.getId())
                    .userId(enrollment.getUserId())
                    .courseId(course != null ? course.getId() : null)
                    .classId(enrollment.getClassId())
                    .status(enrollment.getStatus())
                    .paid(paid)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
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

