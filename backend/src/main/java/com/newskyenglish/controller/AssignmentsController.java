package com.newskyenglish.controller;

import com.newskyenglish.dto.assignments.AssignmentsDTO;
import com.newskyenglish.dto.assignments.AssignmentSubmissionsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.AssignmentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API cho CRUD bài tập, nộp bài và chấm bài.
public class AssignmentsController {

    private final AssignmentsService assignmentService;

    // Lấy danh sách toàn bộ bài tập.
    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getAll()));
    }

    // Lấy chi tiết một bài tập theo id.
    @GetMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<AssignmentsDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getById(id)));
    }

    // Lấy bài tập của một lớp học cụ thể.
    @GetMapping("/assignments/class/{classId}")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getByClass(classId)));
    }

    // Lấy các bài tập thuộc các lớp mà giáo viên hiện tại đang phụ trách.
    @GetMapping("/teacher/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentsDTO.Response>>> getTeacherAssignments(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.getTeacherAssignments(authorizationHeader)
        ));
    }

    // Tạo bài tập mới.
    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<AssignmentsDTO.Response>> create(
            @RequestBody @Valid AssignmentsDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(assignmentService.create(request), "Tạo bài tập thành công"));
    }

    // Tạo bài tập mới nhưng chỉ trong lớp do giáo viên hiện tại quản lý.
    @PostMapping("/teacher/assignments")
    public ResponseEntity<ApiResponse<AssignmentsDTO.Response>> createForTeacher(
            @RequestBody @Valid AssignmentsDTO.CreateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        assignmentService.createForTeacher(request, authorizationHeader),
                        "Tạo bài tập thành công"
                ));
    }

    // Cập nhật nội dung bài tập.
    @PutMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<AssignmentsDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid AssignmentsDTO.UpdateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.update(id, request, authorizationHeader),
                "Cập nhật thành công"
        ));
    }

    // Xóa bài tập khỏi hệ thống.
    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        assignmentService.delete(id, authorizationHeader);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa"));
    }

    // Lấy danh sách bài nộp của một assignment.
    @GetMapping("/assignments/{id}/submissions")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionsDTO.Response>>> getSubmissions(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.getSubmissions(id, authorizationHeader)
        ));
    }

    // Lấy toàn bộ bài nộp của một học viên.
    @GetMapping("/assignments/submit/user/{userId}")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionsDTO.Response>>> getSubmitsByUser(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.getSubmitsByUser(userId, authorizationHeader)
        ));
    }

    // Giáo viên xem các bài tập đã nộp của một học viên thuộc lớp mình.
    @GetMapping("/teacher/students/{userId}/assignments/submissions")
    public ResponseEntity<ApiResponse<List<AssignmentSubmissionsDTO.Response>>> getTeacherStudentSubmissions(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.getTeacherStudentSubmissions(userId, authorizationHeader)
        ));
    }

    // Nhận file hoặc nội dung bài làm của học viên và lưu thành submission.
    @PostMapping("/assignments/{id}/submit")
    public ResponseEntity<ApiResponse<AssignmentSubmissionsDTO.Response>> submit(
            @PathVariable Long id,
            @RequestBody @Valid AssignmentSubmissionsDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.submit(id, request, authorizationHeader),
                "Nộp bài thành công"
        ));
    }

    // Chấm điểm và phản hồi cho một submission cụ thể.
    @PutMapping("/assignments/submissions/{submitId}/grade")
    public ResponseEntity<ApiResponse<AssignmentSubmissionsDTO.Response>> grade(
            @PathVariable Long submitId,
            @RequestBody @Valid AssignmentSubmissionsDTO.GradeRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                assignmentService.grade(submitId, request, authorizationHeader),
                "Chấm điểm thành công"
        ));
    }
}

