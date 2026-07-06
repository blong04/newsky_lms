package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_receivers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity đại diện cho một người nhận cụ thể của một thông báo broadcast.
public class NotificationReceivers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receiver_id")
    private Long id;

    @Column(name = "notification_id")
    private Long notificationId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    // Join sang bản ghi thông báo chính để tái sử dụng title/content/type/createdAt.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", insertable = false, updatable = false)
    private Notifications notification;

    public String getTitle() {
        return notification != null ? notification.getTitle() : null;
    }

    public String getContent() {
        return notification != null ? notification.getContent() : null;
    }

    public String getType() {
        return notification != null ? notification.getType() : null;
    }

    public LocalDateTime getCreatedAt() {
        return notification != null ? notification.getCreatedAt() : null;
    }

    @PrePersist
    public void prePersist() {
        if (read == null) {
            read = false;
        }
    }
}

