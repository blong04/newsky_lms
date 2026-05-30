package com.newskyenglish.controller;

import com.newskyenglish.dto.auth.AuthResponse;
import com.newskyenglish.dto.auth.LoginRequest;
import com.newskyenglish.dto.auth.RegisterRequest;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
// Expose các endpoint công khai cho đăng nhập và đăng ký tài khoản.
public class AuthController {

    private final AuthService authService;

    // Xử lý đăng nhập và trả về thông tin người dùng kèm JWT cho frontend.
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Đăng nhập thành công"));
    }

    // Tạo tài khoản mới theo role được chọn trong form đăng ký.
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.<Void>success(
                null,
                authService.getRegisterSuccessMessage(request.getRoleId())
        ));
    }
}
