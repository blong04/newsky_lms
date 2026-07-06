package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity biểu diễn một bài tập được giao cho lớp học.
public class Assignments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assign_id")
    private Long id;

    @Column(name = "class_id")
    private Long classId;

    @Column(name = "title", length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Schema mới dùng assignment_type dạng text tự do thay vì enum cứng.
    @Column(name = "assignment_type", length = 50)
    private String type;

    @Column(name = "due_date")
    private LocalDateTime deadline;

    @Column(name = "max_score", precision = 5, scale = 2)
    private BigDecimal maxScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.active;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Status  { active, inactive, closed }
}

