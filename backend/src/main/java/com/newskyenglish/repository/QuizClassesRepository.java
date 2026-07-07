package com.newskyenglish.repository;

import com.newskyenglish.model.QuizClasses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
// Repository truy vấn liên kết quiz - lớp học trong schema mới.
public interface QuizClassesRepository extends JpaRepository<QuizClasses, Long> {
    List<QuizClasses> findByQuizId(Long quizId);
    List<QuizClasses> findByClassId(Long classId);
    List<QuizClasses> findByClassIdIn(Collection<Long> classIds);
    void deleteByQuizId(Long quizId);
}
