import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quizService } from "../../services/quizService";
import { buildQuizSectionsForDisplay } from "../../utils/assessmentSections";
import { formatCountdown } from "../../utils/format";
import toast from "react-hot-toast";
import "./TakeQuiz.css";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // State dữ liệu quiz, đáp án và bộ đếm thời gian làm bài.
  const [quiz, setQuiz] = useState(null);
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    quizService.getStudentQuiz(quizId)
      .then((response) => {
        const { quiz: quizData, groups: groupData, questions: questionData } = response;
        setQuiz(quizData);
        setGroups(groupData || []);
        setQuestions(questionData || []);
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Không thể tải bài kiểm tra");
        navigate("/student/exercises");
      })
      .finally(() => setLoading(false));
  }, [quizId, navigate]);

  // Bộ đếm ngược thời gian và tự nộp khi hết giờ.
  useEffect(() => {
    if (timeLeft === null || submitted) {
      return undefined;
    }
    if (timeLeft <= 0) {
      handleSubmit();
      return undefined;
    }

    timerRef.current = setTimeout(() => setTimeLeft((current) => current - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const handleAnswer = (questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }));
  const sections = buildQuizSectionsForDisplay(quiz, groups, questions);

  const handleSubmit = async () => {
    if (submitting || submitted) {
      return;
    }

    clearTimeout(timerRef.current);
    setSubmitting(true);
    try {
      // Gửi câu trả lời lên backend để lưu submission và chấm phần auto-grade nhất quán với results page.
      const response = await quizService.submitStudentQuiz(quizId, {
        answers,
        timeSpent: quiz?.timeLimit && timeLeft != null ? (quiz.timeLimit * 60) - timeLeft : null,
      });
      setResult(response);
      setSubmitted(true);
      toast.success("Đã nộp bài");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (!quiz) {
    return <div className="empty-state"><p>Không tìm thấy bài kiểm tra</p></div>;
  }

  if (submitted && result) {
    return (
      <div className="quiz-result fade-in">
        <div className="result-card">
          <div className="result-icon">{result.score >= 70 ? "🎉" : result.score >= 50 ? "📝" : "💪"}</div>
          <h2>Kết quả bài kiểm tra</h2>
          <h3>{quiz.title}</h3>
          <div className="result-score">
            <span className="score-big">{result.score}</span>
            <span className="score-label">/100</span>
          </div>
          <p>{result.correct}/{result.total} câu đúng</p>
          <div className="result-band">
            {quiz.examType === "IELTS" && <p>Band ước tính: <strong>{(result.score / 100 * 9).toFixed(1)}</strong></p>}
            {quiz.examType === "TOEIC" && <p>Score ước tính: <strong>{Math.round(result.score / 100 * 990)}</strong>/990</p>}
          </div>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>← Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page fade-in take-quiz">
      {/* Header quiz cố định để student luôn thấy tiêu đề và đồng hồ. */}
      <div className="quiz-header">
        <div className="quiz-info">
          <span className={`badge ${quiz.examType === "IELTS" ? "badge-blue" : "badge-green"}`}>{quiz.examType}</span>
          <h2>{quiz.title}</h2>
          <p>{quiz.examPart}</p>
        </div>
        <div className={`quiz-timer ${timeLeft !== null && timeLeft < 300 ? "take-quiz__timer--danger" : ""}`}>
          {timeLeft !== null && <><span>⏱</span><span className="timer-display">{formatCountdown(timeLeft)}</span></>}
        </div>
      </div>

      {quiz.instructions && <div className="quiz-instructions"><strong>📋 Hướng dẫn:</strong> {quiz.instructions}</div>}

      {quiz.audioUrl && (
        <div className="quiz-audio">
          <p><strong>🔊 File nghe:</strong></p>
          <audio controls src={quiz.audioUrl} className="take-quiz__audio" />
        </div>
      )}

      {quiz.passageText && (
        <div className="quiz-passage">
          <h4>📄 Bài đọc</h4>
          <div className="passage-text">{quiz.passageText}</div>
        </div>
      )}

      {/* Phần nội dung câu hỏi theo group hoặc danh sách phẳng. */}
      <div className="questions-section">
        {questions.length === 0 && (
          <div className="empty-state">
            <p>Đề này hiện chưa có câu hỏi hiển thị. Bạn hãy quay lại và báo admin kiểm tra lại dữ liệu quiz.</p>
          </div>
        )}
        {sections.map((section, sectionIndex) => {
          const previousQuestionCount = sections
            .slice(0, sectionIndex)
            .reduce((total, currentSection) => total + currentSection.questions.length, 0);

          return (
            <div key={section.key} className="question-group-block">
              {section.group?.title && <h4>{section.group.title}</h4>}
              {section.group?.passageText && <div className="group-passage"><p>{section.group.passageText}</p></div>}
              {section.group?.imageUrl && <img src={section.group.imageUrl} alt="Question group" className="question-image" />}
              {section.group?.audioUrl && <audio controls src={section.group.audioUrl} className="take-quiz__group-audio" />}
              {section.group?.instructions && <p className="group-instructions">{section.group.instructions}</p>}
              {section.questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  q={question}
                  index={previousQuestionCount + index}
                  answers={answers}
                  onAnswer={handleAnswer}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="quiz-footer">
        <p className="take-quiz__answered-count">Đã trả lời: {Object.keys(answers).length}/{questions.length} câu</p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <span className="spinner" /> : "Nộp bài ✅"}
        </button>
      </div>
    </div>
  );
}

function QuestionItem({ q, index, answers, onAnswer }) {
  const questionType = normalizeQuestionType(q.questionType);

  return (
    <div className="question-item">
      <p className="question-content">
        <span className="q-num">{index + 1}.</span> {q.content}
      </p>
      {q.imageUrl && <img src={q.imageUrl} alt="Question" className="question-image" />}

      {questionType === "mcq" && (
        <div className="options-list">
          {["A", "B", "C", "D"].map((option) => {
            const value = q[`option${option}`];
            if (!value) {
              return null;
            }
            return (
              <label key={option} className={`option-item ${answers[q.id] === option ? "selected" : ""}`}>
                <input type="radio" name={`q_${q.id}`} value={option} checked={answers[q.id] === option} onChange={() => onAnswer(q.id, option)} />
                <span className="option-letter">{option}</span>
                <span>{value}</span>
              </label>
            );
          })}
        </div>
      )}

      {questionType === "fill_blank" && (
        <input className="fill-blank-input" placeholder="Nhập câu trả lời..." value={answers[q.id] || ""} onChange={(event) => onAnswer(q.id, event.target.value)} />
      )}

      {questionType === "matching" && (
        <textarea
          className="writing-area"
          rows={4}
          placeholder="Nhập kết quả nối cột hoặc đáp án tương ứng..."
          value={answers[q.id] || ""}
          onChange={(event) => onAnswer(q.id, event.target.value)}
        />
      )}

      {questionType === "writing" && (
        <textarea className="writing-area" rows={8} placeholder="Viết bài của bạn tại đây..." value={answers[q.id] || ""} onChange={(event) => onAnswer(q.id, event.target.value)} />
      )}
    </div>
  );
}

// Gom các biến thể tên kiểu câu hỏi về nhóm render chuẩn để frontend không bị trắng vì lệch dữ liệu.
function normalizeQuestionType(rawType) {
  const normalizedType = String(rawType || "").trim().toLowerCase();

  if (["mcq", "multiple_choice"].includes(normalizedType)) {
    return "mcq";
  }
  if (["fill_blank", "fill-in-blank", "short_answer", "text"].includes(normalizedType)) {
    return "fill_blank";
  }
  if (["matching", "ordering"].includes(normalizedType)) {
    return "matching";
  }
  if (["writing", "essay"].includes(normalizedType)) {
    return "writing";
  }

  return "writing";
}
