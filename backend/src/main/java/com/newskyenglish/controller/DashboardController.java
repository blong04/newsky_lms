package com.newskyenglish.controller;

import com.newskyenglish.dto.dashboard.DashboardDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
// Tập trung các API dashboard theo từng nhóm người dùng vào một feature controller riêng.
public class DashboardController {

    private final DashboardService dashboardService;

    // Trả về số liệu tổng quan cho dashboard quản trị.
    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<DashboardDTO.AdminStatsResponse>> getAdminStats() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminStats()));
    }

    // Trả về số liệu tổng quan cho dashboard học viên.
    @GetMapping("/student/dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO.StudentSummaryResponse>> getStudentSummary(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getStudentSummary(authorizationHeader)));
    }

    // Trả về số liệu tổng quan cho dashboard giáo viên.
    @GetMapping("/teacher/dashboard")
    public ResponseEntity<ApiResponse<DashboardDTO.TeacherSummaryResponse>> getTeacherSummary(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getTeacherSummary(authorizationHeader)));
    }
}
