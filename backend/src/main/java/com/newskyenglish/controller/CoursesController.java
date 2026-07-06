package com.newskyenglish.controller;

import com.newskyenglish.dto.courses.CoursesDTO;
import com.newskyenglish.dto.classes.ClassesDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.CoursesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
// Expose API cho khóa học và danh sách lớp trực thuộc từng khóa.
public class CoursesController {

    private final CoursesService courseService;

    // Lấy danh sách toàn bộ khóa học.
    @GetMapping
    public ResponseEntity<ApiResponse<List<CoursesDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getAll()));
    }

    // Lấy thông tin chi tiết của một khóa học.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CoursesDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getById(id)));
    }

    // Lấy các lớp học thuộc một khóa học để frontend hiển thị theo course.
    @GetMapping("/{id}/classes")
    public ResponseEntity<ApiResponse<List<ClassesDTO.Response>>> getCourseClasses(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourseClasses(id)));
    }

    // Tạo khóa học mới trong hệ thống.
    @PostMapping
    public ResponseEntity<ApiResponse<CoursesDTO.Response>> create(@RequestBody @Valid CoursesDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(courseService.create(request), "Tạo khóa học thành công"));
    }

    // Cập nhật thông tin khóa học hiện có.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CoursesDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid CoursesDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(courseService.update(id, request), "Cập nhật thành công"));
    }

    // Xóa khóa học khi không còn sử dụng.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Xóa thành công"));
    }
}

