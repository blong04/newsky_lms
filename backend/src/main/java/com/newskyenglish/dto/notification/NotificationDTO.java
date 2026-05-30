package com.newskyenglish.dto.notification;

import com.newskyenglish.model.UserNotification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Gom request/response cho thông báo cá nhân và thông báo broadcast.
public class NotificationDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotNull(message = "Thiếu userId")
        private Long userId;

        @NotBlank(message = "Thiếu tiêu đề thông báo")
        private String title;

        @NotBlank(message = "Thiếu nội dung thông báo")
        private String content;

        private String type;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BroadcastRequest {
        @NotBlank(message = "Thiếu tiêu đề thông báo")
        private String title;

        @NotBlank(message = "Thiếu nội dung thông báo")
        private String content;

        private String type;
        private Integer targetRole;
        private Long targetUserId;
        private Long targetClassId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String title;
        private String content;
        private String type;
        private Boolean read;
        private LocalDateTime createdAt;

        // Chuyển entity thông báo sang DTO dùng chung cho inbox.
        public static Response fromEntity(UserNotification notification) {
            return Response.builder()
                    .id(notification.getId())
                    .userId(notification.getUserId())
                    .title(notification.getTitle())
                    .content(notification.getContent())
                    .type(notification.getType())
                    .read(notification.getRead())
                    .createdAt(notification.getCreatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendResult {
        private Integer sent;

        public static SendResult fromCount(int sent) {
            return SendResult.builder().sent(sent).build();
        }
    }
}
