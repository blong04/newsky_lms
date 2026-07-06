package com.newskyenglish.repository;

import com.newskyenglish.model.TestSubmissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repository truy vấn lịch sử làm test theo test hoặc học viên.
public interface TestSubmissionsRepository extends JpaRepository<TestSubmissions, Long> {
    List<TestSubmissions> findByTestId(Long testId);
    List<TestSubmissions> findByUserId(Long userId);
}
