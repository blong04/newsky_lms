package com.newskyenglish.exception;

// Dùng khi id hoặc tài nguyên yêu cầu không tồn tại trong hệ thống.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
