package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "passages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu đoạn văn/đề bài phụ trợ cho quiz, assignment hoặc test full form.
public class Passages {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "passage_id")
    private Long id;

    @Column(name = "quiz_id")
    private Long quizId;

    @Column(name = "assign_id")
    private Long assignId;

    @Column(name = "test_id")
    private Long testId;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "LONGTEXT", nullable = false)
    private String content;

    @Column(name = "payment_type", length = 50)
    private String paymentType;

    @Column(name = "order_num")
    @Builder.Default
    private Integer orderNum = 1;
}
