package com.newskyenglish.repository;

import com.newskyenglish.model.Questions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn câu hỏi của quiz và đếm số câu liên quan.
public interface QuestionsRepository extends JpaRepository<Questions, Long> {
    List<Questions> findByQuizIdOrderByOrderNumAsc(Long quizId);
    List<Questions> findByGroupIdOrderByOrderNumAsc(Long groupId);
    long countByQuizId(Long quizId);
    void deleteByQuizId(Long quizId);
}

