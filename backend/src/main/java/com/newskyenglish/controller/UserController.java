package com.newskyenglish.controller;

import com.newskyenglish.dto.user.UserDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
// Expose API CRUD người dùng và thao tác đổi mật khẩu.
public class UserController {

    private final UserService userService;

    // Lấy toàn bộ người dùng để hiển thị ở màn quản trị tài khoản.
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDTO.Response>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(userService.getAll()));
    }

    // Lấy chi tiết một người dùng theo id.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    // Tạo tài khoản người dùng mới từ dữ liệu admin nhập vào.
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO.Response>> create(@RequestBody @Valid UserDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(userService.create(request), "Tạo người dùng thành công"));
    }

    // Cập nhật thông tin cơ bản của người dùng.
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDTO.Response>> update(
            @PathVariable Long id,
            @RequestBody @Valid UserDTO.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.update(id, request), "Cập nhật thành công"));
    }

    // Đổi mật khẩu cho người dùng được chọn.
    @PutMapping("/{id}/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@PathVariable Long id,
                                                            @RequestBody @Valid UserDTO.ChangePasswordRequest request) {
        userService.changePassword(id, request);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đổi mật khẩu thành công"));
    }

    // Xóa tài khoản người dùng khỏi hệ thống.
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã xóa người dùng"));
    }
}
