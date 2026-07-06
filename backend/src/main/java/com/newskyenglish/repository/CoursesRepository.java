package com.newskyenglish.repository;

import com.newskyenglish.model.Courses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn dữ liệu khóa học.
public interface CoursesRepository extends JpaRepository<Courses, Long> {
    List<Courses> findByStatus(Courses.Status status);
    List<Courses> findByExamType(Courses.ExamType examType);
}

