package com.newskyenglish.repository;

import com.newskyenglish.model.Quizzes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn quiz theo lesson hoặc theo loại chứng chỉ.
public interface QuizzesRepository extends JpaRepository<Quizzes, Long> {
    List<Quizzes> findByExamType(Quizzes.ExamType examType);
    List<Quizzes> findByClassId(Long classId);
    List<Quizzes> findByClassIdIn(List<Long> classIds);
}

