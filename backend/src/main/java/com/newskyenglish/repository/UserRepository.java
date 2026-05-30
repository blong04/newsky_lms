package com.newskyenglish.repository;

import com.newskyenglish.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// Repository truy vấn người dùng theo id, email và các điều kiện đăng nhập cơ bản.
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
