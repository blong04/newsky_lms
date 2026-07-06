package com.newskyenglish.controller;

import com.newskyenglish.dto.notifications.NotificationsDTO;
import com.newskyenglish.payload.ApiResponse;
import com.newskyenglish.service.NotificationsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
// Expose API để đọc và gửi thông báo cá nhân.
public class NotificationsController {

    private final NotificationsService notificationService;

    // Lấy danh sách thông báo của người dùng hiện tại dựa trên JWT.
    @GetMapping("/notifications/my")
    public ResponseEntity<ApiResponse<List<NotificationsDTO.Response>>> getMyNotifications(
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getMyNotifications(authorizationHeader)));
    }

    // Đánh dấu một thông báo cụ thể là đã đọc.
    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<ApiResponse<NotificationsDTO.Response>> markRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.markRead(id, authorizationHeader)));
    }

    // Đánh dấu tất cả thông báo của người dùng hiện tại là đã đọc.
    @PutMapping("/notifications/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@RequestHeader("Authorization") String authorizationHeader) {
        notificationService.markAllRead(authorizationHeader);
        return ResponseEntity.ok(ApiResponse.<Void>success(null, "Đã đọc tất cả"));
    }

    // Gửi một thông báo đơn lẻ vào hệ thống.
    @PostMapping("/notifications/send")
    public ResponseEntity<ApiResponse<NotificationsDTO.Response>> send(
            @RequestBody @Valid NotificationsDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.send(request), "Đã gửi thông báo"));
    }

    // Gửi thông báo diện rộng từ admin tới các nhóm người dùng được chọn.
    @PostMapping("/admin/notifications/send")
    public ResponseEntity<ApiResponse<NotificationsDTO.SendResult>> sendAdminBroadcast(
            @RequestBody @Valid NotificationsDTO.BroadcastRequest request) {
        NotificationsDTO.SendResult result = notificationService.sendAdminBroadcast(request);
        return ResponseEntity.ok(ApiResponse.success(
                result,
                "Đã gửi thông báo đến " + result.getSent() + " người"
        ));
    }

    // Gửi thông báo từ giáo viên đến học viên trong các lớp mình quản lý.
    @PostMapping("/teacher/notifications/send")
    public ResponseEntity<ApiResponse<NotificationsDTO.SendResult>> sendTeacherBroadcast(
            @RequestBody @Valid NotificationsDTO.BroadcastRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {
        NotificationsDTO.SendResult result = notificationService.sendTeacherBroadcast(request, authorizationHeader);
        return ResponseEntity.ok(ApiResponse.success(
                result,
                "Đã gửi thông báo đến " + result.getSent() + " học viên"
        ));
    }
}

