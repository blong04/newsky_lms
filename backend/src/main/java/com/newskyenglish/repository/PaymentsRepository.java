package com.newskyenglish.repository;

import com.newskyenglish.model.Payments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repository truy vấn lịch sử thanh toán theo người dùng hoặc khóa học.
public interface PaymentsRepository extends JpaRepository<Payments, Long> {
    List<Payments> findByUserId(Long userId);
    List<Payments> findByCourseId(Long courseId);
}
