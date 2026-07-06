package com.newskyenglish.repository;

import com.newskyenglish.model.NotificationReceivers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn thông báo cá nhân của người dùng.
public interface NotificationReceiversRepository extends JpaRepository<NotificationReceivers, Long> {
    List<NotificationReceivers> findByUserId(Long userId);
}

