package com.newskyenglish.service;

import com.newskyenglish.exception.UnauthorizedException;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
// Gói gọn logic lấy user hiện tại từ JWT để các service nghiệp vụ dùng lại dễ hơn.
public class CurrentUserService {

    private final JwtUtil jwtUtil;

    // Dùng cho các service cần suy ra user hiện tại từ Authorization header.
    public Long extractUserId(String authorizationHeader) {
        return jwtUtil.extractUserId(extractToken(authorizationHeader));
    }

    // Chuẩn hóa cách bóc token Bearer từ header trước khi decode JWT.
    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Thiếu hoặc sai định dạng Authorization header");
        }
        return authorizationHeader.substring(7);
    }
}
