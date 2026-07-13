package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu giao dịch thanh toán gắn trực tiếp với từng enrollment.
public class Payments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pay_id")
    private Long id;

    @Column(name = "enrollment_id")
    private Long enrollmentId;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Thời điểm thanh toán được ghi nhận thành công hoặc tạo giao dịch.
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "status", length = 50)
    private String status;
}
