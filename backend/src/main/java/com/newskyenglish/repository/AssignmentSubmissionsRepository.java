package com.newskyenglish.repository;

import com.newskyenglish.model.AssignmentSubmissions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn bài nộp bài tập theo assignment hoặc theo học viên.
public interface AssignmentSubmissionsRepository extends JpaRepository<AssignmentSubmissions, Long> {
    List<AssignmentSubmissions> findByAssignId(Long assignId);
    List<AssignmentSubmissions> findByUserId(Long userId);
    List<AssignmentSubmissions> findByAssignIdAndUserId(Long assignId, Long userId);
}

