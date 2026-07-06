package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu trạng thái thanh toán học phí theo người dùng và khóa học.
public class Payments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pay_id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    // Schema dump hiện ghi là maid_at, nên giữ đúng tên cột để tránh lệch.
    @Column(name = "maid_at")
    private LocalDateTime paidAt;

    @Column(name = "status", length = 50)
    private String status;
}
