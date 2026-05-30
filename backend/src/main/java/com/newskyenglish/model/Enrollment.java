package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu việc một học viên đăng ký vào khóa hoặc lớp cụ thể.
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EnrollID")
    private Long id;

    @Column(name = "UserID")
    private Long userId;

    @Column(name = "CourseID")
    private Long courseId;

    @Column(name = "ClassID")
    private Long classId;

    @Column(name = "NgayGhiDanh")
    private LocalDateTime enrollDate;

    @Column(name = "NgayDuyet")
    private LocalDateTime approvedDate;

    @Column(name = "NguoiDuyet")
    private Long approvedBy;

    @Column(name = "Paid")
    @Builder.Default
    private Boolean paid = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.pending;

    // Giữ progress ở mức transient để frontend cũ vẫn đọc được, dù cột này đã bỏ khỏi DB.
    @Transient
    private BigDecimal progress;

    // Giữ completedDate ở mức transient để tránh mismatch schema khi DB đã bỏ cột.
    @Transient
    private LocalDateTime completedDate;

    public enum Status { pending, approved, rejected, enrolled, completed, dropped }
}
