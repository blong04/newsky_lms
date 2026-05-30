package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "courses")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity biểu diễn khóa học mà trung tâm đang mở bán hoặc giảng dạy.
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CourseID")
    private Long id;

    @Column(name = "TieuDe", length = 150)
    private String title;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    private String description;

    @Column(name = "Gia", precision = 10, scale = 2)
    private BigDecimal price;

    // Thuộc tính cũ đã bỏ khỏi DB, giữ transient để tránh làm vỡ các DTO cũ.
    @Transient
    private String thumbnail;

    @Enumerated(EnumType.STRING)
    @Column(name = "MucDo")
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "ExamType")
    private ExamType examType;

    // Thuộc tính cũ đã bỏ khỏi DB, sĩ số thực tế hiện được tính qua enrollment.
    @Transient
    private Integer studentCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    @CreationTimestamp
    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    public enum Level { beginner, intermediate, advanced }
    public enum Status { active, inactive }
    public enum ExamType { IELTS, TOEIC, OTHER }
}
