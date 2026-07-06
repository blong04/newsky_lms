package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question_groups")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity gom nhóm câu hỏi theo passage, audio hoặc section chung.
public class QuestionGroups {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "passage_text", columnDefinition = "LONGTEXT")
    private String passageText;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "order_num")
    @Builder.Default
    private Integer orderNum = 1;

    @Column(name = "test_id")
    private Long testId;
}

