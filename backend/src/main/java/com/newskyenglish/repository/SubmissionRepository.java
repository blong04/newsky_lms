package com.newskyenglish.repository;

import com.newskyenglish.model.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
// Repository truy vấn bài nộp quiz theo quiz hoặc theo học viên.
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByQuizId(Long quizId);
    List<Submission> findByUserId(Long userId);
    Optional<Submission> findFirstByQuizIdAndUserId(Long quizId, Long userId);
}
