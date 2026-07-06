package com.newskyenglish.repository;

import com.newskyenglish.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
// Repository truy vấn người dùng theo id, email và các điều kiện đăng nhập cơ bản.
public interface UsersRepository extends JpaRepository<Users, Long> {

    Optional<Users> findByEmail(String email);

    boolean existsByEmail(String email);
}

