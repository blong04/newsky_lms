import "./QuestionNavigator.css";

// Sidebar hiện lưới số thứ tự câu hỏi, tô màu câu đã trả lời, bấm vào để
// cuộn tới đúng vị trí câu hỏi đó trong bài làm.
export default function QuestionNavigator({ flatQuestions = [], answers = {} }) {
  const answeredCount = flatQuestions.filter((item) => {
    const value = answers[item.id];
    return value !== undefined && value !== null && value !== "";
  }).length;

  const scrollToQuestion = (questionId) => {
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (flatQuestions.length === 0) {
    return null;
  }

  return (
    <aside className="question-navigator">
      <div className="question-navigator__header">
        <p className="question-navigator__title">Danh sách câu hỏi</p>
        <p className="question-navigator__count">{answeredCount}/{flatQuestions.length} đã trả lời</p>
      </div>

      <div className="question-navigator__legend">
        <span><i className="question-navigator__dot question-navigator__dot--answered" />Đã chọn</span>
        <span><i className="question-navigator__dot question-navigator__dot--unanswered" />Chưa chọn</span>
      </div>

      <div className="question-navigator__grid">
        {flatQuestions.map((item) => {
          const value = answers[item.id];
          const isAnswered = value !== undefined && value !== null && value !== "";
          return (
            <button
              key={item.id}
              type="button"
              className={`question-navigator__item ${isAnswered ? "question-navigator__item--answered" : ""}`}
              onClick={() => scrollToQuestion(item.id)}
              title={`Câu ${item.number} - ${isAnswered ? "đã trả lời" : "chưa trả lời"}`}
            >
              {item.number}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
