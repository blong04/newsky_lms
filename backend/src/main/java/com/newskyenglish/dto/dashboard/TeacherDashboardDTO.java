package com.newskyenglish.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Chứa dữ liệu tổng quan hiển thị ở dashboard giáo viên.
public class TeacherDashboardDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SummaryResponse {
        // classCount là tổng số lớp giáo viên đang phụ trách.
        private Long classCount;
        // assignmentCount là tổng số bài tập thuộc các lớp của giáo viên.
        private Long assignmentCount;
        // pendingCount là số bài nộp đang chờ chấm hoặc cần xem lại.
        private Long pendingCount;
    }
}
