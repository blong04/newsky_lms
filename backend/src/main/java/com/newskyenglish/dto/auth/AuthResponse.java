package com.newskyenglish.dto.auth;

import com.newskyenglish.dto.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Response trả về sau khi đăng nhập thành công, gồm token và hồ sơ người dùng.
public class AuthResponse {
    private String token;
    private UserDTO.Response user;
}
