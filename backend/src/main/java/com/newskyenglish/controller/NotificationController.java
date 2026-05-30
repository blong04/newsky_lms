package com.newskyenglish.controller;

import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
// Expose API để đọc và gửi thông báo cá nhân.
public class NotificationController {

    private final NotificationService notificationService;

    // Lấy danh sách thông báo của người dùng hiện tại dựa trên JWT.
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<NotificationDTO.Response>>> getMyNotifications(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getMyNotifications(authorizationHeader)));
    }

    // Đánh dấu một thông báo cụ thể là đã đọc.
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDTO.Response>> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markRead(id)));
    }

    // Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@RequestHeader("Authorization") String authorizationHeader) {
        notificationService.markAllRead(authorizationHeader);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã đọc tất cả"));
    }

    // Gửi một thông báo đơn lẻ vào hệ thống.
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationDTO.Response>> send(
            @RequestBody @Valid NotificationDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.send(request), "Đã gửi thông báo"));
    }
}
