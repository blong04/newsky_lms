package com.newskyenglish.repository;

import com.newskyenglish.model.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// Repository thao tác với bản ghi thông báo gốc trước khi gắn người nhận.
public interface NotificationsRepository extends JpaRepository<Notifications, Long> {
}

