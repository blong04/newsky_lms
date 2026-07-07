package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity biểu diễn một câu hỏi đơn lẻ, luôn thuộc về một question group.
public class Questions {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "question_type", length = 50)
    private String questionType; // mcq, fill_blank, image_word, matching, ordering

    @Column(name = "question_text", columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "audio_url", length = 255)
    private String audioUrl;

    @Column(name = "option_a", length = 255)
    private String optionA;

    @Column(name = "option_b", length = 255)
    private String optionB;

    @Column(name = "option_c", length = 255)
    private String optionC;

    @Column(name = "option_d", length = 255)
    private String optionD;

    @Column(name = "correct_answer", length = 255)
    private String correctAnswer;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "order_num")
    @Builder.Default
    private Integer orderNum = 1;

}

