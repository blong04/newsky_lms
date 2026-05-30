package com.newskyenglish.repository;

import com.newskyenglish.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn câu hỏi của quiz và đếm số câu liên quan.
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizIdOrderByOrderNumAsc(Long quizId);
    List<Question> findByGroupIdOrderByOrderNumAsc(Long groupId);
    long countByQuizId(Long quizId);
    void deleteByQuizId(Long quizId);
}
