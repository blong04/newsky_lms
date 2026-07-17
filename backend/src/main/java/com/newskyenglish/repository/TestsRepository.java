package com.newskyenglish.repository;

import com.newskyenglish.model.Tests;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repository truy vấn bài thi thử theo loại chứng chỉ.
public interface TestsRepository extends JpaRepository<Tests, Long> {
    List<Tests> findByType(String type);
}
