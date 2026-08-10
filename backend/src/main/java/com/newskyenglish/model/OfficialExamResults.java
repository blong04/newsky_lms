package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "official_exam_results")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity lưu điểm thi chính thức bên ngoài trung tâm để đánh giá học lại hoặc học tiếp.
public class OfficialExamResults {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "official_result_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false)
    private Courses.ExamType examType;

    @Column(name = "score", precision = 6, scale = 2, nullable = false)
    private BigDecimal score;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "certificate_url", length = 255)
    private String certificateUrl;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
