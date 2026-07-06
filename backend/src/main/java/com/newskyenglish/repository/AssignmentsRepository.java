package com.newskyenglish.repository;

import com.newskyenglish.model.Assignments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn bài tập theo id hoặc theo lớp học.
public interface AssignmentsRepository extends JpaRepository<Assignments, Long> {
    List<Assignments> findByClassId(Long classId);
}

