package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_classes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity ánh xạ quan hệ nhiều-nhiều giữa mock test và lớp học.
public class TestClasses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "test_class_id")
    private Long id;

    @Column(name = "mock_test_id", nullable = false)
    private Long mockTestId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
