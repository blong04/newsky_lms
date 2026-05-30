package com.newskyenglish.controller;

import com.newskyenglish.dto.assignment.AssignmentDTO;
import com.newskyenglish.dto.assignment.AssignmentSubmitDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@RequiredArgsConstructor
// Expose API cho CRUD bài tập, nộp bài và chấm bài.
public class AssignmentController {

    private final AssignmentService assignmentService;

    // Lấy danh sách toàn bộ bài tập.
    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAll()));
    }

    // Lấy chi tiết một bài tập theo id.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getById(id)));
    }

    // Lấy bài tập của một lớp học cụ thể.
    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<AssignmentDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getByClass(classId)));
    }

    // Tạo bài tập mới.
    @PostMapping
    public ResponseEntity<ApiResponse<AssignmentDTO.Response>> create(
            @RequestBody @Valid AssignmentDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignmentService.create(request), "Tạo bài tập thành công"));
    }

    // Cập nhật nội dung bài tập.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AssignmentDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid AssignmentDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.update(id, request), "Cập nhật thành công"));
    }

    // Xóa bài tập khỏi hệ thống.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa"));
    }

    // Lấy danh sách bài nộp của một assignment.
    @GetMapping("/{id}/submissions")
    public ResponseEntity<ApiResponse<List<AssignmentSubmitDTO.Response>>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissions(id)));
    }

    // Lấy toàn bộ bài nộp của một học viên.
    @GetMapping("/submit/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssignmentSubmitDTO.Response>>> getSubmitsByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmitsByUser(userId)));
    }

    // Nhận file hoặc nội dung bài làm của học viên và lưu thành submission.
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<AssignmentSubmitDTO.Response>> submit(
            @PathVariable Long id,
            @RequestBody @Valid AssignmentSubmitDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.submit(id, request, authorizationHeader),
                "Nộp bài thành công"
        ));
    }

    // Chấm điểm và phản hồi cho một submission cụ thể.
    @PutMapping("/submissions/{submitId}/grade")
    public ResponseEntity<ApiResponse<AssignmentSubmitDTO.Response>> grade(
            @PathVariable Long submitId,
            @RequestBody @Valid AssignmentSubmitDTO.GradeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.grade(submitId, request), "Chấm điểm thành công"));
    }
}
