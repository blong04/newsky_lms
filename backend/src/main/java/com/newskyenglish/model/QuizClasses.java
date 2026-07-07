package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_classes")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity ánh xạ quan hệ nhiều-nhiều giữa quiz và lớp học.
public class QuizClasses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_class_id")
    private Long id;

    @Column(name = "quiz_id", nullable = false)
    private Long quizId;

    @Column(name = "class_id", nullable = false)
    private Long classId;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
