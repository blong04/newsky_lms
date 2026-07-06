package com.newskyenglish.controller;

import com.newskyenglish.dto.schedules.SchedulesDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.SchedulesService;
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
public class SchedulesController {

    private final SchedulesService scheduleService;

    // Lấy toàn bộ lịch học trong hệ thống.
    @GetMapping
    public ResponseEntity<ApiResponse<List<SchedulesDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getAll()));
    }

    // Lấy lịch học của một lớp cụ thể.
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<SchedulesDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getByClass(classId)));
    }

    // Tạo một buổi học hoặc lịch học mới.
    @PostMapping
    public ResponseEntity<ApiResponse<SchedulesDTO.Response>> create(@RequestBody @Valid SchedulesDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(scheduleService.create(request), "Tạo lịch thành công"));
    }

    // Cập nhật thông tin của một lịch học hiện có.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SchedulesDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid SchedulesDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.update(id, request), "Cập nhật thành công"));
    }
}


