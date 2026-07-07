package com.newskyenglish.repository;

import com.newskyenglish.model.TestSubmissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
// Repository truy vấn lịch sử làm test theo test hoặc học viên.
public interface TestSubmissionsRepository extends JpaRepository<TestSubmissions, Long> {
    List<TestSubmissions> findByMockTestId(Long mockTestId);
    List<TestSubmissions> findByUserId(Long userId);
    List<TestSubmissions> findByMockTestIdAndUserIdOrderByAttemptNumberDesc(Long mockTestId, Long userId);
    Optional<TestSubmissions> findFirstByMockTestIdAndUserIdOrderByAttemptNumberDesc(Long mockTestId, Long userId);
}
