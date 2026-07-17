package com.newskyenglish.repository;

import com.newskyenglish.model.Quizzes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
// Repository truy vấn quiz theo loại chứng chỉ hoặc danh sách id đã gắn qua bảng trung gian.
public interface QuizzesRepository extends JpaRepository<Quizzes, Long> {
    List<Quizzes> findByType(Quizzes.Type type);
}

