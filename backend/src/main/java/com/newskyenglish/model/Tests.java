package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mock_tests")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity đại diện cho bài thi thử full form; liên kết lớp học đi qua bảng test_classes.
public class Tests {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long id;

    @Column(name = "title", length = 150, nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "test_type", length = 50, nullable = false)
    private String testType;

    @Column(name = "exam_type", length = 50, nullable = false)
    private String examType;

    @Column(name = "exam_part", length = 50)
    private String examPart;

    @Column(name = "skill_type", length = 50, nullable = false)
    private String skillType;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_score", precision = 5, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "attempts_allowed")
    @Builder.Default
    private Integer attemptsAllowed = 1;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Giữ timestamp nhất quán ngay cả khi Hibernate chưa flush xuống DB.
    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    // Cập nhật mốc sửa cuối ở tầng entity để response luôn phản ánh đúng.
    @PreUpdate
    private void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
