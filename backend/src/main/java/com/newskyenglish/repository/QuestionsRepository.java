package com.newskyenglish.repository;

import com.newskyenglish.model.Questions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
// Repository truy vấn câu hỏi theo group đã được chuẩn hóa trong schema mới.
public interface QuestionsRepository extends JpaRepository<Questions, Long> {
    List<Questions> findByGroupIdOrderByOrderNumAsc(Long groupId);
    List<Questions> findByGroupIdInOrderByOrderNumAsc(Collection<Long> groupIds);
    long countByGroupIdIn(Collection<Long> groupIds);
    void deleteByGroupIdIn(Collection<Long> groupIds);
}

