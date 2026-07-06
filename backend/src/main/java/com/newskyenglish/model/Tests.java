package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tests")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity đại diện cho bài test full form như TOEIC/IELTS mock test hoàn chỉnh.
public class Tests {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_id")
    private Long id;

    @Column(name = "class_id")
    private Long classId;

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

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
