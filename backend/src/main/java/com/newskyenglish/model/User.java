package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity biểu diễn tài khoản người dùng với role admin, teacher hoặc student.
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")        // ← thực tế là UserID không phải userid
    private Long id;

    @Column(name = "HoTen", length = 100)
    private String name;

    @Column(name = "Email", length = 100, unique = true)
    private String email;

    @Column(name = "MatKhau", length = 255)
    private String password;

    @Column(name = "SoDienThoai", length = 15)
    private String phoneNumber;

    @Column(name = "DiaChi", columnDefinition = "TEXT")
    private String address;

    @Column(name = "RoleID")        // ← thực tế là RoleID
    private Integer roleId;

    @Column(name = "AnhDaiDien", length = 255)
    private String avatarUrl;

    @Column(name = "NgayTao", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "NgayCapNhat")
    private LocalDateTime updatedAt;

    @Column(name = "Duyet")
    @Builder.Default
    private Boolean approved = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "TrangThai")
    @Builder.Default
    private Status status = Status.active;

    // DB hiện không còn các cột điểm cũ, giữ transient để không làm vỡ DTO/profile cũ.
    @Transient
    private Double ieltsScore;

    // DB hiện không còn các cột điểm cũ, giữ transient để không làm vỡ DTO/profile cũ.
    @Transient
    private Integer toeicScore;

    // DB hiện không còn các cột điểm cũ, giữ transient để không làm vỡ DTO/profile cũ.
    @Transient
    private Integer satScore;

    @Column(name = "ChuyenMon", columnDefinition = "TEXT")
    private String specialization;

    @Column(name = "KinhNghiem", length = 255)
    private String experience;

    @Column(name = "HocVan", length = 255)
    private String education;

    public enum Status { active, inactive, suspended }
}
