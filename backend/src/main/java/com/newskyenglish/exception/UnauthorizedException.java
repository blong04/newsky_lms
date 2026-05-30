package com.newskyenglish.exception;

// Dùng khi request thiếu token hoặc token không đủ để xác thực người dùng.
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
