package com.newskyenglish.repository;

import com.newskyenglish.model.QuestionGroups;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn các block câu hỏi theo owner hiện tại: assignment, quiz hoặc mock test.
public interface QuestionGroupsRepository extends JpaRepository<QuestionGroups, Long> {
    List<QuestionGroups> findByQuizIdOrderByOrderNumAsc(Long quizId);
    List<QuestionGroups> findByAssignIdOrderByOrderNumAsc(Long assignId);
    List<QuestionGroups> findByMockTestIdOrderByOrderNumAsc(Long mockTestId);
    void deleteByQuizId(Long quizId);
    void deleteByAssignId(Long assignId);
    void deleteByMockTestId(Long mockTestId);
}

