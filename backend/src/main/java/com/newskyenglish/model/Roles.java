package com.newskyenglish.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
// Entity ánh xạ bảng vai trò để backend nhận diện các role từ schema mới.
public class Roles {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @Column(name = "role_name", length = 50, nullable = false)
    private String roleName;
}
