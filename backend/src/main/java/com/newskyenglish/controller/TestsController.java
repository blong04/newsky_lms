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
    public ResponseEntity<ApiResponse<List<TestsDTO.Response>>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(ApiResponse.success(testsService.getAll(keyword, type)));
    }

    // Lấy trạng thái placement hiện tại của học viên.
    @GetMapping("/placement/status")
    public ResponseEntity<ApiResponse<TestsDTO.PlacementStatusResponse>> getPlacementStatus(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getPlacementStatus(authorizationHeader)
        ));
    }

    // Học viên tự làm lại bài xếp lớp - xóa kết quả cũ để chọn loại chứng chỉ khác hoặc làm lại.
    @PostMapping("/placement/reset")
    public ResponseEntity<ApiResponse<Void>> resetPlacement(
            @RequestHeader("Authorization") String authorizationHeader) {
        testsService.resetPlacement(authorizationHeader);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã đặt lại bài xếp lớp"));
    }

    // Chọn ngẫu nhiên một đề placement TOEIC hoặc IELTS từ pool đã cấu hình.
    @GetMapping("/placement/random")
    public ResponseEntity<ApiResponse<TestsDTO.Response>> getRandomPlacementTest(
            @RequestParam String type,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getRandomPlacementTest(type, authorizationHeader)
        ));
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

    // Lấy toàn bộ dữ liệu test để admin/teacher xem hoặc học viên xem lại sau khi nộp.
    @GetMapping("/{id}/full")
    public ResponseEntity<ApiResponse<TestsDTO.FullResponse>> getFullTest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getFullTest(id, authorizationHeader)
        ));
    }

    // Lấy dữ liệu test cho học viên làm bài.
    @GetMapping("/student/{id}")
    public ResponseEntity<ApiResponse<TestsDTO.StudentTestResponse>> getStudentTest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getStudentTest(id, authorizationHeader)
        ));
    }

    // Lấy dữ liệu đề placement cho học viên làm bài xếp lớp lần đầu.
    @GetMapping("/placement/{id}")
    public ResponseEntity<ApiResponse<TestsDTO.StudentTestResponse>> getPlacementTest(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getPlacementTest(id, authorizationHeader)
        ));
    }

    // Lấy danh sách test thuộc lớp mà giáo viên đang phụ trách.
    @GetMapping("/teacher")
    public ResponseEntity<ApiResponse<List<TestsDTO.Response>>> getTeacherTests(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getTeacherTests(authorizationHeader)
        ));
    }

    // Lấy lịch sử làm test của một học viên.
    @GetMapping("/submissions/user/{userId}")
    public ResponseEntity<ApiResponse<List<TestsDTO.SubmissionResponse>>> getUserSubmissions(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getUserSubmissions(userId, authorizationHeader)
        ));
    }

    // Giáo viên xem lịch sử làm test của một học viên thuộc lớp mình.
    @GetMapping("/teacher/students/{userId}/submissions")
    public ResponseEntity<ApiResponse<List<TestsDTO.SubmissionResponse>>> getTeacherStudentSubmissions(
            @PathVariable Long userId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getTeacherStudentSubmissions(userId, authorizationHeader)
        ));
    }

    // Lấy danh sách bài làm test cho giáo viên phụ trách lớp.
    @GetMapping("/teacher/{id}/submissions")
    public ResponseEntity<ApiResponse<List<TestsDTO.SubmissionResponse>>> getTeacherTestSubmissions(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.getTeacherTestSubmissions(id, authorizationHeader)
        ));
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

    // Nhận đáp án của học viên, chấm tự động và lưu bài làm test.
    @PostMapping("/student/{id}/submit")
    public ResponseEntity<ApiResponse<TestsDTO.SubmitResultResponse>> submitStudentTest(
            @PathVariable Long id,
            @RequestBody @Valid TestsDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.submitStudentTest(id, request, authorizationHeader),
                "Nộp bài thi thử thành công"
        ));
    }

    // Học viên nộp bài placement và nhận gợi ý khóa học phù hợp ngay sau khi chấm.
    @PostMapping("/placement/{id}/submit")
    public ResponseEntity<ApiResponse<TestsDTO.PlacementSubmitResponse>> submitPlacementTest(
            @PathVariable Long id,
            @RequestBody @Valid TestsDTO.SubmitRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.submitPlacementTest(id, request, authorizationHeader),
                "Đã hoàn thành bài thi xếp lớp"
        ));
    }

    // Giáo viên sửa điểm bài làm test khi cần chấm lại.
    @PutMapping("/teacher/submissions/{submissionId}/grade")
    public ResponseEntity<ApiResponse<TestsDTO.SubmissionResponse>> gradeTeacherSubmission(
            @PathVariable Long submissionId,
            @RequestBody @Valid TestsDTO.GradeSubmissionRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                testsService.gradeTeacherSubmission(submissionId, request, authorizationHeader),
                "Cập nhật điểm bài làm thành công"
        ));
    }
}
