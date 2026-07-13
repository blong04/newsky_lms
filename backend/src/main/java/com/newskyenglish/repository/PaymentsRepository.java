package com.newskyenglish.repository;

import com.newskyenglish.model.Payments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repository truy vấn giao dịch thanh toán theo enrollment.
public interface PaymentsRepository extends JpaRepository<Payments, Long> {
    List<Payments> findByEnrollmentId(Long enrollmentId);
    List<Payments> findByEnrollmentIdIn(List<Long> enrollmentIds);
}
