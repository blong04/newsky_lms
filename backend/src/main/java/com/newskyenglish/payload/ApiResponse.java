package com.newskyenglish.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Kiểu response chung cho hầu hết API: trạng thái, thông điệp và dữ liệu trả về.
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    // Tạo response thành công kèm dữ liệu và thông điệp tùy chỉnh.
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    // Tạo response thành công với thông điệp mặc định.
    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Thành công");
    }

    // Tạo response lỗi khi cần trả thông báo thất bại nhất quán.
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}
