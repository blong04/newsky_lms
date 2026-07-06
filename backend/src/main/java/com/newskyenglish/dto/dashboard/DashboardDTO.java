package com.newskyenglish.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Gom toàn bộ response của feature dashboard vào cùng một DTO để tránh tách theo role.
public class DashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AdminStatsResponse {
        // totalUsers là tổng số tài khoản đang tồn tại trong hệ thống.
        private Long totalUsers;
        // totalStudents là số tài khoản học viên.
        private Long totalStudents;
        // totalTeachers là số tài khoản giáo viên đã được tạo.
        private Long totalTeachers;
        // pendingTeachers là số giáo viên đang chờ admin phê duyệt.
        private Long pendingTeachers;
        // totalCourses là tổng số khóa học đang được quản lý.
        private Long totalCourses;
        // totalClasses là tổng số lớp học đã tạo.
        private Long totalClasses;
        // activeClasses là số lớp đang ở trạng thái hoạt động.
        private Long activeClasses;
        // pendingEnrollments là số yêu cầu đăng ký học còn chờ xử lý.
        private Long pendingEnrollments;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentSummaryResponse {
        // activeEnrollmentCount là số khóa/lớp học viên đang theo học.
        private Long activeEnrollmentCount;
        // completedEnrollmentCount là số khóa học đã hoàn thành.
        private Long completedEnrollmentCount;
        // pendingEnrollmentCount là số đăng ký còn chờ duyệt.
        private Long pendingEnrollmentCount;
        // quizSubmissionCount là số lượt làm bài kiểm tra đã lưu.
        private Long quizSubmissionCount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeacherSummaryResponse {
        // classCount là tổng số lớp giáo viên đang phụ trách.
        private Long classCount;
        // assignmentCount là tổng số bài tập thuộc các lớp của giáo viên.
        private Long assignmentCount;
        // pendingCount là số bài nộp đang chờ chấm hoặc cần xem lại.
        private Long pendingCount;
    }
}
