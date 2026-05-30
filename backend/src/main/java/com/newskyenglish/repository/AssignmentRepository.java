package com.newskyenglish.repository;

import com.newskyenglish.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn bài tập theo id hoặc theo lớp học.
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassId(Long classId);
    List<Assignment> findByExamType(Assignment.ExamType examType);
}
