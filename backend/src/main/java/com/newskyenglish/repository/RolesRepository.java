package com.newskyenglish.repository;

import com.newskyenglish.model.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// Repository đọc danh mục vai trò từ bảng roles.
public interface RolesRepository extends JpaRepository<Roles, Long> {
}
