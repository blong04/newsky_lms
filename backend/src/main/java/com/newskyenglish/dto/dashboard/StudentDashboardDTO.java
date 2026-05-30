package com.newskyenglish.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Chứa dữ liệu tổng quan hiển thị ở dashboard học viên.
public class StudentDashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        // activeEnrollmentCount là số khóa/lớp học viên đang theo học.
        private Long activeEnrollmentCount;
        // completedEnrollmentCount là số khóa học đã hoàn thành.
        private Long completedEnrollmentCount;
        // pendingEnrollmentCount là số đăng ký còn chờ duyệt.
        private Long pendingEnrollmentCount;
        // quizSubmissionCount là số lượt làm bài kiểm tra đã lưu.
        private Long quizSubmissionCount;
    }
}
