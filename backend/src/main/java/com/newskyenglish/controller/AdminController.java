package com.newskyenglish.controller;

import com.newskyenglish.dto.admin.AdminStatsDTO;
import com.newskyenglish.dto.classroom.ClassRoomDTO;
import com.newskyenglish.dto.enrollment.EnrollmentDTO;
import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.dto.user.UserDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Tập hợp các API dành riêng cho quản trị viên như dashboard, lớp học và duyệt hồ sơ.
public class AdminController {

    private final AdminService adminService;

    // Trả về số liệu tổng quan để hiển thị trên dashboard quản trị.
    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<AdminStatsDTO.Response>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    // Lấy toàn bộ lớp học để admin quản lý và phân công giáo viên.
    @GetMapping("/admin/classes")
    public ResponseEntity<ApiResponse<List<ClassRoomDTO.Response>>> getAllClasses() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllClasses()));
    }

    // Tạo một lớp học mới từ dữ liệu admin nhập vào.
    @PostMapping("/admin/classes")
    public ResponseEntity<ApiResponse<ClassRoomDTO.Response>> createClass(
            @RequestBody @Valid ClassRoomDTO.CreateRequest request) {
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(adminService.createClass(request), "Tạo lớp học thành công"));
    }

    // Cập nhật thông tin lớp học đã tồn tại.
    @PutMapping("/admin/classes/{id}")
    public ResponseEntity<ApiResponse<ClassRoomDTO.Response>> updateClass(
            @PathVariable Long id,
            @RequestBody @Valid ClassRoomDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateClass(id, request), "Cập nhật thành công"));
    }

    // Xóa một lớp học khỏi hệ thống.
    @DeleteMapping("/admin/classes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable Long id) {
        adminService.deleteClass(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa lớp học"));
    }

    // Gán giáo viên cho một lớp học cụ thể.
    @PutMapping("/admin/classes/{classId}/assign-teacher/{teacherId}")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(@PathVariable Long classId,
                                                           @PathVariable Long teacherId) {
        adminService.assignTeacher(classId, teacherId);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Phân công giáo viên thành công"));
    }

    // Lấy danh sách toàn bộ đăng ký học để phục vụ màn hình quản lý enrollments.
    @GetMapping("/enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.Response>>> getAllEnrollments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllEnrollments()));
    }

    // Lấy danh sách đăng ký theo từng lớp học.
    @GetMapping("/enrollments/class/{classId}")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.Response>>> getEnrollmentsByClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEnrollmentsByClass(classId)));
    }

    // Lấy các đăng ký đang chờ duyệt để admin xử lý.
    @GetMapping("/admin/pending-enrollments")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.Response>>> getPendingEnrollments() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingEnrollments()));
    }

    // Trả về dữ liệu enrollments đã join sẵn để frontend giảm số lần gọi API chi tiết.
    @GetMapping("/admin/enrollments/details")
    public ResponseEntity<ApiResponse<List<EnrollmentDTO.AdminDetailResponse>>> getEnrollmentDetails() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEnrollmentDetails()));
    }

    // Duyệt một yêu cầu đăng ký học.
    @PutMapping("/admin/enrollments/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveEnrollment(@PathVariable Long id) {
        adminService.approveEnrollment(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Duyệt đăng ký thành công"));
    }

    // Cập nhật trạng thái hoặc ghi chú của một enrollment.
    @PutMapping("/enrollments/{id}")
    public ResponseEntity<ApiResponse<EnrollmentDTO.Response>> updateEnrollment(
            @PathVariable Long id,
            @RequestBody @Valid EnrollmentDTO.UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateEnrollment(id, request), "Cập nhật thành công"));
    }

    // Hủy một đăng ký học đã tồn tại.
    @PutMapping("/enrollments/{id}/cancel")
    public ResponseEntity<ApiResponse<EnrollmentDTO.Response>> cancelEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.cancelEnrollment(id), "Đã hủy đăng ký"));
    }

    // Lấy danh sách giáo viên đang chờ phê duyệt tài khoản.
    @GetMapping("/admin/pending-teachers")
    public ResponseEntity<ApiResponse<List<UserDTO.Response>>> getPendingTeachers() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingTeachers()));
    }

    // Phê duyệt tài khoản giáo viên sau khi admin kiểm tra xong.
    @PutMapping("/admin/users/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveTeacher(@PathVariable Long id) {
        adminService.approveTeacher(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Phê duyệt thành công"));
    }

    // Từ chối đăng ký giáo viên và xóa tài khoản chờ duyệt.
    @DeleteMapping("/admin/users/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectTeacher(@PathVariable Long id) {
        adminService.rejectTeacher(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã từ chối và xóa tài khoản"));
    }

    // Gửi thông báo diện rộng từ admin tới các nhóm người dùng được chọn.
    @PostMapping("/admin/notifications/send")
    public ResponseEntity<ApiResponse<NotificationDTO.SendResult>> sendNotification(
            @RequestBody @Valid NotificationDTO.BroadcastRequest request) {
        NotificationDTO.SendResult result = adminService.sendNotification(request);
        return ResponseEntity.ok(ApiResponse.success(
                result,
                "Đã gửi thông báo đến " + result.getSent() + " người"
        ));
    }

    // Public endpoint để frontend lấy danh sách lớp hiển thị cho học viên.
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<ClassRoomDTO.Response>>> getClassesPublic() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getClassesPublic()));
    }
}
