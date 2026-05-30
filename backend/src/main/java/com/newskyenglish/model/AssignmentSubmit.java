package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignmentsubmit")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu từng lượt nộp bài tập của học viên.
public class AssignmentSubmit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SubmitID")
    private Long id;

    @Column(name = "AssignID")
    private Long assignId;

    @Column(name = "UserID")
    private Long userId;

    // Tên cột thật là NoiDung (không phải content/NoiDungBai)
    @Column(name = "NoiDung", columnDefinition = "TEXT")
    private String content;

    @Column(name = "Diem", precision = 5, scale = 2)
    private BigDecimal score;

    @Column(name = "NhanXet", columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.submitted;

    @Column(name = "NgayNop")
    private LocalDateTime submittedAt;

    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (submittedAt == null) submittedAt = LocalDateTime.now();
    }

    public enum Status { submitted, graded, late, resubmit }
}
