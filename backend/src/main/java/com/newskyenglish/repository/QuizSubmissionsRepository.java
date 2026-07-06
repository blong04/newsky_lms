package com.newskyenglish.repository;

import com.newskyenglish.model.QuizSubmissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
// Repository truy vấn bài nộp quiz theo quiz hoặc theo học viên.
public interface QuizSubmissionsRepository extends JpaRepository<QuizSubmissions, Long> {
    List<QuizSubmissions> findByQuizId(Long quizId);
    List<QuizSubmissions> findByUserId(Long userId);
    Optional<QuizSubmissions> findFirstByQuizIdAndUserId(Long quizId, Long userId);
}

