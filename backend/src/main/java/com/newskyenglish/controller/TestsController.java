package com.newskyenglish.controller;

import com.newskyenglish.dto.tests.TestsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.TestsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tests")
@RequiredArgsConstructor
// Expose API cơ bản cho bảng tests theo naming mới của database.
public class TestsController {

    private final TestsService testsService;

    // Lấy toàn bộ full test hiện có.
    @GetMapping
    public ResponseEntity<ApiResponse<List<TestsDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(testsService.getAll()));
    }

    // Lấy chi tiết một bài test.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TestsDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testsService.getById(id)));
    }

    // Lấy danh sách test theo lớp học.
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<TestsDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(testsService.getByClass(classId)));
    }

    // Lấy bài nộp của một bài test.
    @GetMapping("/{id}/submissions")
    public ResponseEntity<ApiResponse<List<TestsDTO.SubmissionResponse>>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(testsService.getSubmissions(id)));
    }

    // Tạo mới một bài test full form.
    @PostMapping
    public ResponseEntity<ApiResponse<TestsDTO.Response>> create(@RequestBody @Valid TestsDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(testsService.create(request), "Tạo test thành công"));
    }

    // Cập nhật metadata của test.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TestsDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid TestsDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(testsService.update(id, request), "Cập nhật thành công"));
    }

    // Xóa một bài test khỏi hệ thống.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        testsService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Xóa test thành công"));
    }
}
