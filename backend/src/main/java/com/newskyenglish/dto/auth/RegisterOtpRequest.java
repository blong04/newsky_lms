package com.newskyenglish.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
// Payload bước 1: người dùng nhập thông tin để hệ thống gửi OTP xác minh email.
public class RegisterOtpRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 4, max = 4, message = "Mật khẩu phải đúng 4 ký tự")
    @Pattern(regexp = "\\d{4}", message = "Mật khẩu phải gồm đúng 4 chữ số")
    private String password;
}
