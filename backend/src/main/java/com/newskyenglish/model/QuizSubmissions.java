package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_submissions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu bài làm quiz mà học viên đã nộp.
public class QuizSubmissions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_submission_id")
    private Long id;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "answers_json", columnDefinition = "LONGTEXT")
    private String answersJson;

    @Column(name = "score")
    private Float score;

    @Column(name = "duration")
    private Integer timeSpent;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}

