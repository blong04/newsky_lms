package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu việc một học viên đăng ký vào một lớp học cụ thể.
public class Enrollments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enroll_id")
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "enrolled_at")
    private LocalDateTime enrollDate;

    @Column(name = "approved_at")
    private LocalDateTime approvedDate;

    @Column(name = "approved_by")
    private Long approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status")
    @Builder.Default
    private Status status = Status.pending;

    public enum Status { pending, approved, rejected, cancelled, completed }
}

