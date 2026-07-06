package com.newskyenglish.repository;

import com.newskyenglish.model.Passages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// Repository truy vấn passage theo quiz, assignment hoặc test.
public interface PassagesRepository extends JpaRepository<Passages, Long> {
    List<Passages> findByQuizIdOrderByOrderNumAsc(Long quizId);
    List<Passages> findByAssignIdOrderByOrderNumAsc(Long assignId);
    List<Passages> findByTestIdOrderByOrderNumAsc(Long testId);
}
