package com.newskyenglish.repository;

import com.newskyenglish.model.AssignmentSubmit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn bài nộp bài tập theo assignment hoặc theo học viên.
public interface AssignmentSubmitRepository extends JpaRepository<AssignmentSubmit, Long> {
    List<AssignmentSubmit> findByAssignId(Long assignId);
    List<AssignmentSubmit> findByUserId(Long userId);
    List<AssignmentSubmit> findByAssignIdAndUserId(Long assignId, Long userId);
}
