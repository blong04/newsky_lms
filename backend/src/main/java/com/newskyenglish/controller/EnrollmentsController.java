package com.newskyenglish.controller;

import com.newskyenglish.dto.enrollments.EnrollmentsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.EnrollmentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API nghiệp vụ ghi danh theo feature enrollment thay vì tách controller theo role.
public class EnrollmentsController {

    private final EnrollmentsService enrollmentsService;

    // Lấy danh sách toàn bộ đăng ký học để phục vụ màn hình quản lý enrollments.
    @GetMapping("/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(enrollmentsService.getAll()));
    }

    // Lấy danh sách đăng ký theo từng lớp học.
    @GetMapping("/enrollments/class/{classId}")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.Response>>> getByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(enrollmentsService.getByClass(classId)));
    }

    // Lấy danh sách khóa/lớp học mà học viên đang hoặc đã đăng ký.
    @GetMapping("/student/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.StudentResponse>>> getStudentEnrollments(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                enrollmentsService.getStudentEnrollments(authorizationHeader)
        ));
    }

    // Tạo yêu cầu đăng ký học mới cho học viên hiện tại.
    @PostMapping("/student/enroll")
    public ResponseEntity<ApiResponse<Void>> createStudentEnrollment(
            @RequestBody @Valid EnrollmentsDTO.StudentEnrollRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        enrollmentsService.createStudentEnrollment(request, authorizationHeader);
        boolean paid = Boolean.TRUE.equals(request.getPaid());
        return ResponseEntity.ok(ApiResponse.<Void>success(
                null,
                enrollmentsService.getEnrollmentSuccessMessage(paid)
        ));
    }

    // Lấy các đăng ký đang chờ duyệt để admin xử lý.
    @GetMapping("/admin/pending-enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.Response>>> getPending() {
        return ResponseEntity.ok(ApiResponse.success(enrollmentsService.getPending()));
    }

    // Trả về dữ liệu enrollment đã join sẵn để frontend quản trị hiển thị.
    @GetMapping("/admin/enrollments/details")
    public ResponseEntity<ApiResponse<List<EnrollmentsDTO.AdminDetailResponse>>> getAdminDetails() {
        return ResponseEntity.ok(ApiResponse.success(enrollmentsService.getAdminDetails()));
    }

    // Duyệt một yêu cầu đăng ký học.
    @PutMapping("/admin/enrollments/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable Long id) {
        enrollmentsService.approve(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Duyệt đăng ký thành công"));
    }

    // Cập nhật trạng thái của một enrollment.
    @PutMapping("/enrollments/{id}")
    public ResponseEntity<ApiResponse<EnrollmentsDTO.Response>> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid EnrollmentsDTO.UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                enrollmentsService.updateStatus(id, request),
                "Cập nhật thành công"
        ));
    }

    // Hủy một đăng ký học đã tồn tại.
    @PutMapping("/enrollments/{id}/cancel")
    public ResponseEntity<ApiResponse<EnrollmentsDTO.Response>> cancel(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                enrollmentsService.cancel(id, authorizationHeader),
                "Đã hủy đăng ký"
        ));
    }
}
