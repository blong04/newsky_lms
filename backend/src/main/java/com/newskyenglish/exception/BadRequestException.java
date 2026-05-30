package com.newskyenglish.exception;

// Dùng khi request hợp lệ về mặt cú pháp nhưng dữ liệu đầu vào không đúng nghiệp vụ.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
