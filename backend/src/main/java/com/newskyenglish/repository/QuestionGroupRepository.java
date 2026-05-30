package com.newskyenglish.repository;

import com.newskyenglish.model.QuestionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn các nhóm câu hỏi của một quiz.
public interface QuestionGroupRepository extends JpaRepository<QuestionGroup, Long> {
    List<QuestionGroup> findByQuizIdOrderByOrderNumAsc(Long quizId);
    void deleteByQuizId(Long quizId);
}
