package com.newskyenglish.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
// Trả về kết quả kiểm tra email đã được dùng trong hệ thống hay chưa.
public class EmailAvailabilityResponse {
    private boolean available;
    private String message;
}
