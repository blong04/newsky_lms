package com.newskyenglish.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Gom các response dùng cho dashboard quản trị viên.
public class AdminStatsDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
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
}
