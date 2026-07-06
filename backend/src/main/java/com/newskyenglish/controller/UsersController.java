package com.newskyenglish.controller;

import com.newskyenglish.dto.users.UsersDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.UsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API CRUD người dùng và thao tác đổi mật khẩu.
public class UsersController {

    private final UsersService userService;

    // Lấy toàn bộ người dùng để hiển thị ở màn quản trị tài khoản.
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UsersDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    // Lấy chi tiết một người dùng theo id.
    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UsersDTO.Response>> getById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id, authorizationHeader)));
    }

    // Tạo tài khoản người dùng mới từ dữ liệu admin nhập vào.
    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UsersDTO.Response>> create(@RequestBody @Valid UsersDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.create(request), "Tạo người dùng thành công"));
    }

    // Cập nhật thông tin cơ bản của người dùng.
    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UsersDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid UsersDTO.UpdateRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.update(id, request, authorizationHeader),
                "Cập nhật thành công"
        ));
    }

    // Đổi mật khẩu cho người dùng được chọn.
    @PutMapping("/users/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @RequestBody @Valid UsersDTO.ChangePasswordRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        userService.changePassword(id, request, authorizationHeader);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đổi mật khẩu thành công"));
    }

    // Xóa tài khoản người dùng khỏi hệ thống.
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa người dùng"));
    }

    // Lấy danh sách giáo viên đang chờ phê duyệt tài khoản.
    @GetMapping("/admin/pending-teachers")
    public ResponseEntity<ApiResponse<List<UsersDTO.Response>>> getPendingTeachers() {
        return ResponseEntity.ok(ApiResponse.success(userService.getPendingTeachers()));
    }

    // Phê duyệt tài khoản giáo viên sau khi admin kiểm tra xong.
    @PutMapping("/admin/users/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveTeacher(@PathVariable Long id) {
        userService.approveTeacher(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Phê duyệt thành công"));
    }

    // Từ chối đăng ký giáo viên và xóa tài khoản chờ duyệt.
    @DeleteMapping("/admin/users/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectTeacher(@PathVariable Long id) {
        userService.rejectTeacher(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã từ chối và xóa tài khoản"));
    }
}

