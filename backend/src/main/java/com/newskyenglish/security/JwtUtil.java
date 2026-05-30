package com.newskyenglish.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
// Tiện ích tạo và giải mã JWT để backend xác định người dùng hiện tại.
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Tạo secret key từ chuỗi cấu hình để dùng cho cả sign và verify token.
    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    // Sinh JWT chứa email, userId và roleId để frontend gửi ở các request sau.
    public String generateToken(Long userId, String email, Integer roleId) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("roleId", roleId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Giải mã toàn bộ claims từ token sau khi đã xác thực chữ ký.
    public Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody();
    }

    // Truy xuất email đã được lưu trong subject của token.
    public String extractEmail(String token) { return extractClaims(token).getSubject(); }
    // Truy xuất userId để service xác định ai đang thao tác.
    public Long extractUserId(String token) { return extractClaims(token).get("userId", Long.class); }
    // Truy xuất roleId để security xác định quyền hiện tại.
    public Integer extractRoleId(String token) { return extractClaims(token).get("roleId", Integer.class); }

    // Token hợp lệ khi parse được claims mà không phát sinh lỗi JWT.
    public boolean isTokenValid(String token) {
        try { extractClaims(token); return true; }
        catch (JwtException | IllegalArgumentException e) { return false; }
    }
}
