package com.newskyenglish.controller;

import com.newskyenglish.dto.auth.AuthResponse;
import com.newskyenglish.dto.auth.EmailAvailabilityResponse;
import com.newskyenglish.dto.auth.LoginRequest;
import com.newskyenglish.dto.auth.RegisterOtpRequest;
import com.newskyenglish.dto.auth.VerifyRegisterOtpRequest;
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

    // Kiểm tra nhanh email đã được dùng chưa để frontend báo sớm trên form đăng ký.
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<EmailAvailabilityResponse>> checkEmailAvailability(
            @RequestParam String email) {
        return ResponseEntity.ok(ApiResponse.success(authService.checkEmailAvailability(email)));
    }

    // Bước 1 của đăng ký: gửi OTP xác minh tới email.
    @PostMapping("/register/request-otp")
    public ResponseEntity<ApiResponse<Void>> requestRegistrationOtp(@RequestBody @Valid RegisterOtpRequest request) {
        String message = authService.requestRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, message));
    }

    // Bước 2 của đăng ký: xác minh OTP rồi mới tạo tài khoản học viên.
    @PostMapping("/register/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyRegistrationOtp(@RequestBody @Valid VerifyRegisterOtpRequest request) {
        String message = authService.verifyRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.<Void>success(
                null,
                message
        ));
    }
}
