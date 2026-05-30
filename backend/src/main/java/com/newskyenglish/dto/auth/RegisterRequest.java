package com.newskyenglish.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
// Payload nhận từ form đăng ký tài khoản mới.
public class RegisterRequest {
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

    private Integer roleId;
}
