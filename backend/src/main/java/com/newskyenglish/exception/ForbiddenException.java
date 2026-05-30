package com.newskyenglish.exception;

// Dùng khi người dùng đã đăng nhập nhưng không có quyền thao tác tài nguyên này.
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
