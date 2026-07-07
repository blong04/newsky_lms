package com.newskyenglish.dto.quizzes;

import com.newskyenglish.model.Quizzes;
import lombok.Data;

import java.util.List;

@Data
// Payload tạo hoặc cập nhật quiz cùng nhóm câu hỏi và câu hỏi con.
public class QuizzesCreateRequest {
    // classId giữ lại để tương thích payload cũ khi chỉ gắn một lớp.
    private Long classId;
    // classIds là danh sách lớp học được gắn với quiz trong schema mới.
    private List<Long> classIds;
    // title là tên hiển thị của bài kiểm tra trên admin và student.
    private String title;
    // type xác định kiểu quiz tổng quát như trắc nghiệm hay viết.
    private Quizzes.QuizType type;
    // examType phục vụ phân loại bài theo IELTS, TOEIC hoặc loại khác.
    private Quizzes.ExamType examType;
    // examPart cho biết part/skill cụ thể như Reading, Listening, Part 5...
    private String examPart;
    // passageText là đoạn văn chung của bài hoặc part nếu cần.
    private String passageText;
    // audioUrl là file nghe chung cho cả bài khi áp dụng.
    private String audioUrl;
    // instructions là hướng dẫn hiển thị trước khi học viên làm bài.
    private String instructions;
    // timeLimit là thời gian giới hạn tính theo phút.
    private Integer timeLimit;
    // groups dùng cho các quiz có nhiều passage hoặc section riêng.
    private List<GroupRequest> groups;
    // questions là danh sách câu hỏi cần lưu cùng quiz.
    private List<QuestionRequest> questions;

    @Data
    public static class GroupRequest {
        // clientKey là khóa tạm từ frontend để gắn câu hỏi vào group mới tạo trong cùng request.
        private String clientKey;
        // title là tiêu đề của block câu hỏi hoặc đoạn đọc/nghe.
        private String title;
        // passageText là nội dung đoạn văn riêng của group.
        private String passageText;
        // imageUrl hỗ trợ các dạng câu hỏi có hình minh họa.
        private String imageUrl;
        // audioUrl hỗ trợ các group nghe riêng biệt.
        private String audioUrl;
        // instructions là hướng dẫn áp dụng riêng cho group.
        private String instructions;
        // orderNum quyết định thứ tự hiển thị của group trong bài.
        private Integer orderNum;
    }

    @Data
    public static class QuestionRequest {
        // groupId liên kết câu hỏi với group tương ứng nếu có.
        private Long groupId;
        // groupKey cho phép câu hỏi tham chiếu tới group mới tạo trong cùng payload.
        private String groupKey;
        // questionType quyết định frontend render kiểu input nào.
        private String questionType;
        // content là nội dung chính của câu hỏi.
        private String content;
        // imageUrl là ảnh minh họa đi kèm từng câu.
        private String imageUrl;
        // audioUrl là file nghe riêng cho từng câu nếu cần.
        private String audioUrl;
        // Các lựa chọn A/B/C/D dùng cho câu trắc nghiệm.
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        // correctAnswer là đáp án backend dùng để auto-grade.
        private String correctAnswer;
        // explanation giúp admin lưu lời giải hoặc ghi chú.
        private String explanation;
        // orderNum quyết định vị trí câu trong bài.
        private Integer orderNum;
    }
}

