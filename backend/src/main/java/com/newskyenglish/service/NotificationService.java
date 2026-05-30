package com.newskyenglish.service;

import com.newskyenglish.dto.notification.NotificationDTO;
import com.newskyenglish.exception.ResourceNotFoundException;
import com.newskyenglish.model.UserNotification;
import com.newskyenglish.repository.UserNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
// Cung cấp hộp thư thông báo cá nhân và thao tác đọc/gửi thông báo.
public class NotificationService {

    private final UserNotificationRepository userNotificationRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    // Lấy hộp thư thông báo của user hiện tại theo thời gian mới nhất.
    public List<NotificationDTO.Response> getMyNotifications(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDTO.Response::fromEntity)
                .toList();
    }

    @Transactional
    // Đánh dấu một thông báo đã được đọc.
    public NotificationDTO.Response markRead(Long id) {
        UserNotification notification = userNotificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        notification.setRead(true);
        return NotificationDTO.Response.fromEntity(userNotificationRepository.save(notification));
    }

    @Transactional
    // Đánh dấu toàn bộ thông báo của user hiện tại là đã đọc.
    public void markAllRead(String authorizationHeader) {
        Long userId = currentUserService.extractUserId(authorizationHeader);
        List<UserNotification> userNotifications = userNotificationRepository.findByUserId(userId);
        userNotifications.forEach(notification -> notification.setRead(true));
        userNotificationRepository.saveAll(userNotifications);
    }

    @Transactional
    // Tạo một bản ghi thông báo mới cho người dùng.
    public NotificationDTO.Response send(NotificationDTO.CreateRequest request) {
        UserNotification notification = UserNotification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType() != null ? request.getType() : "announcement")
                .read(false)
                .build();
        return NotificationDTO.Response.fromEntity(userNotificationRepository.save(notification));
    }
}
