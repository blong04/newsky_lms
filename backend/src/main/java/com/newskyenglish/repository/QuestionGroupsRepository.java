package com.newskyenglish.repository;

import com.newskyenglish.model.QuestionGroups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn các nhóm câu hỏi của một quiz.
public interface QuestionGroupsRepository extends JpaRepository<QuestionGroups, Long> {
    List<QuestionGroups> findByQuizIdOrderByOrderNumAsc(Long quizId);
    void deleteByQuizId(Long quizId);
}

