package com.newskyenglish.controller;

import com.newskyenglish.dto.schedule.ScheduleDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor
// Expose API quản lý lịch học theo lớp.
public class ScheduleController {

    private final ScheduleService scheduleService;

    // Lấy toàn bộ lịch học trong hệ thống.
    @GetMapping
    public ResponseEntity<ApiResponse<List<ScheduleDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAll()));
    }

    // Lấy lịch học của một lớp cụ thể.
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<ScheduleDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getByClass(classId)));
    }

    // Tạo một buổi học hoặc lịch học mới.
    @PostMapping
    public ResponseEntity<ApiResponse<ScheduleDTO.Response>> create(@RequestBody @Valid ScheduleDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.create(request), "Tạo lịch thành công"));
    }

    // Cập nhật thông tin của một lịch học hiện có.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScheduleDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid ScheduleDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.update(id, request), "Cập nhật thành công"));
    }
}
