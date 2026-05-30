package com.newskyenglish.repository;

import com.newskyenglish.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn quiz theo lesson hoặc theo loại chứng chỉ.
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByExamType(Quiz.ExamType examType);
    List<Quiz> findByClassId(Long classId);
    List<Quiz> findByClassIdIn(List<Long> classIds);
}
