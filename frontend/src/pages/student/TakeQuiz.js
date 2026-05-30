import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Student.css";
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
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/student/quiz/${quizId}`)
      .then((response) => {
        const { quiz: quizData, groups: groupData, questions: questionData } = response.data.data;
        setQuiz(quizData);
        setGroups(groupData || []);
        setQuestions(questionData || []);
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60);
        }
      })
      .catch(() => toast.error("Không thể tải bài kiểm tra"))
      .finally(() => setLoading(false));
  }, [quizId]);

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

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const handleAnswer = (questionId, answer) => setAnswers((current) => ({ ...current, [questionId]: answer }));
  const ungroupedQuestions = questions.filter((question) => !question.groupId || !groups.some((group) => group.id === question.groupId));
  const groupedQuestionCount = groups.reduce((total, group) => (
    total + questions.filter((question) => question.groupId === group.id).length
  ), 0);

  const handleSubmit = async () => {
    clearTimeout(timerRef.current);
    try {
      // Gửi câu trả lời lên backend để lưu submission và chấm phần auto-grade nhất quán với results page.
      const response = await api.post(`/student/quiz/${quizId}/submit`, {
        answers,
        timeSpent: quiz?.timeLimit && timeLeft != null ? (quiz.timeLimit * 60) - timeLeft : null,
      });
      setResult(response.data.data);
      setSubmitted(true);
      toast.success("Đã nộp bài");
    } catch {
      toast.error("Không thể nộp bài");
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
          {timeLeft !== null && <><span>⏱</span><span className="timer-display">{formatTime(timeLeft)}</span></>}
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
        {groups.map((group) => (
          <div key={group.id} className="question-group-block">
            {group.passageText && <div className="group-passage"><p>{group.passageText}</p></div>}
            {group.imageUrl && <img src={group.imageUrl} alt="Question" className="question-image" />}
            {group.audioUrl && <audio controls src={group.audioUrl} className="take-quiz__group-audio" />}
            {group.instructions && <p className="group-instructions">{group.instructions}</p>}
            {questions.filter((question) => question.groupId === group.id).map((question, index) => (
              <QuestionItem key={question.id} q={question} index={index} answers={answers} onAnswer={handleAnswer} />
            ))}
          </div>
        ))}

        {ungroupedQuestions.map((question, index) => (
          <QuestionItem key={question.id} q={question} index={(groups.length > 0 ? groupedQuestionCount : 0) + index} answers={answers} onAnswer={handleAnswer} />
        ))}
      </div>

      <div className="quiz-footer">
        <p className="take-quiz__answered-count">Đã trả lời: {Object.keys(answers).length}/{questions.length} câu</p>
        <button className="btn btn-primary" onClick={handleSubmit}>Nộp bài ✅</button>
      </div>
    </div>
  );
}

function QuestionItem({ q, index, answers, onAnswer }) {
  return (
    <div className="question-item">
      <p className="question-content">
        <span className="q-num">{index + 1}.</span> {q.content}
      </p>
      {q.imageUrl && <img src={q.imageUrl} alt="Question" className="question-image" />}

      {q.questionType === "mcq" && (
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

      {q.questionType === "fill_blank" && (
        <input className="fill-blank-input" placeholder="Nhập câu trả lời..." value={answers[q.id] || ""} onChange={(event) => onAnswer(q.id, event.target.value)} />
      )}

      {q.questionType === "writing" && (
        <textarea className="writing-area" rows={8} placeholder="Viết bài của bạn tại đây..." value={answers[q.id] || ""} onChange={(event) => onAnswer(q.id, event.target.value)} />
      )}
    </div>
  );
}
