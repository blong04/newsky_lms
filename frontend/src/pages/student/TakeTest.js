import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { testService } from "../../services/testService";
import { buildTestSectionsForDisplay } from "../../utils/assessmentSections";
import { formatCountdown } from "../../utils/format";
import { normalizeQuestionType } from "../../utils/questionType";
import QuestionNavigator from "../../components/shared/QuestionNavigator";
import toast from "react-hot-toast";
import "./TakeTest.css";

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();
  const isPlacementMode = searchParams.get("mode") === "placement";

  const [test, setTest] = useState(null);
  const [groups, setGroups] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [placementSummary, setPlacementSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTest = isPlacementMode ? testService.getPlacementTest : testService.getStudentTest;

    fetchTest(testId)
      .then((response) => {
        const { test: testData, groups: groupData, questions: questionData } = response;
        setTest(testData);
        setGroups(groupData || []);
        setQuestions(questionData || []);
        if (testData.timeLimit) {
          setTimeLeft(testData.timeLimit * 60);
        }
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || `Không thể tải ${isPlacementMode ? "bài thi xếp lớp" : "bài thi thử"}`);
        navigate(isPlacementMode ? "/student/placement" : "/student/tests");
      })
      .finally(() => setLoading(false));
  }, [isPlacementMode, navigate, testId]);

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
  const sections = buildTestSectionsForDisplay(test, groups, questions);
  // Danh sách phẳng câu hỏi kèm số thứ tự hiển thị, dùng cho sidebar điều hướng.
  const flatQuestions = sections.flatMap((section, sectionIndex) => {
    const previousQuestionCount = sections
      .slice(0, sectionIndex)
      .reduce((total, currentSection) => total + currentSection.questions.length, 0);
    return section.questions.map((question, index) => ({
      id: question.id,
      number: previousQuestionCount + index + 1,
    }));
  });

  const handleSubmit = async () => {
    if (submitting || submitted) {
      return;
    }

    clearTimeout(timerRef.current);
    setSubmitting(true);
    try {
      const submitRequest = {
        answers,
        duration: test?.timeLimit && timeLeft != null ? (test.timeLimit * 60) - timeLeft : null,
      };
      const response = isPlacementMode
        ? await testService.submitPlacementTest(testId, submitRequest)
        : await testService.submitStudentTest(testId, submitRequest);

      if (isPlacementMode) {
        setResult(response.result);
        setPlacementSummary(response);
        if (response.user) {
          updateUser(response.user);
        }
      } else {
        setResult(response);
      }
      setSubmitted(true);
      toast.success(isPlacementMode ? "Đã hoàn thành bài thi xếp lớp" : "Đã nộp bài thi thử");
    } catch (error) {
      toast.error(error.response?.data?.message || `Không thể nộp ${isPlacementMode ? "bài thi xếp lớp" : "bài thi thử"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (!test) {
    return <div className="empty-state"><p>Không tìm thấy bài thi thử</p></div>;
  }

  if (submitted && result) {
    if (isPlacementMode) {
      const recommendations = placementSummary?.recommendations?.recommendedCourses || [];
      const nextLevelCourses = placementSummary?.recommendations?.nextLevelCourses || [];

      return (
        <div className="quiz-result fade-in">
          <div className="result-card">
            <div className="result-icon">🎯</div>
            <h2>Kết quả bài thi xếp lớp</h2>
            <h3>{test.title}</h3>
            <div className="result-score">
              <span className="score-big">{Number(result.score).toFixed(1)}</span>
              <span className="score-label">/{test.totalScore || 100}</span>
            </div>
            <p>{result.correct}/{result.total} câu đúng</p>
            <div className="result-band">
              {test.type === "IELTS" && <p>Band ước tính: <strong>{((Number(result.score) / Number(test.totalScore || 100)) * 9).toFixed(1)}</strong></p>}
              {test.type === "TOEIC" && <p>Score ước tính: <strong>{Math.round((Number(result.score) / Number(test.totalScore || 100)) * 990)}</strong>/990</p>}
            </div>

            {(recommendations.length > 0 || nextLevelCourses.length > 0) && (
              <div className="take-test__placement-recommendations">
                {recommendations.length > 0 && (
                  <div className="take-test__placement-block">
                    <p className="take-test__placement-title">Khóa học phù hợp hiện tại</p>
                    <ul className="take-test__placement-list">
                      {recommendations.map((course) => (
                        <li key={course.id}>
                          <strong>{course.title}</strong>
                          <span>{course.recommendationReason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {nextLevelCourses.length > 0 && (
                  <div className="take-test__placement-block">
                    <p className="take-test__placement-title">Lộ trình cao hơn sau khi đạt mục tiêu</p>
                    <ul className="take-test__placement-list">
                      {nextLevelCourses.map((course) => (
                        <li key={course.id}>
                          <strong>{course.title}</strong>
                          <span>{course.recommendationReason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-primary" onClick={() => navigate("/student/courses")}>Xem khóa học gợi ý</button>
          </div>
        </div>
      );
    }

    return (
      <div className="quiz-result fade-in">
        <div className="result-card">
          <div className="result-icon">{Number(result.score) >= 70 ? "🎉" : Number(result.score) >= 50 ? "📝" : "💪"}</div>
          <h2>Kết quả bài thi thử</h2>
          <h3>{test.title}</h3>
          <div className="result-score">
            <span className="score-big">{Number(result.score).toFixed(1)}</span>
            <span className="score-label">/{test.totalScore || 100}</span>
          </div>
          <p>{result.correct}/{result.total} câu đúng</p>
          <div className="result-band">
            {test.type === "IELTS" && <p>Band ước tính: <strong>{((Number(result.score) / Number(test.totalScore || 100)) * 9).toFixed(1)}</strong></p>}
            {test.type === "TOEIC" && <p>Score ước tính: <strong>{Math.round((Number(result.score) / Number(test.totalScore || 100)) * 990)}</strong>/990</p>}
          </div>
          <button className="btn btn-primary" onClick={() => navigate("/student/results")}>Xem kết quả</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-take-layout">
      <QuestionNavigator flatQuestions={flatQuestions} answers={answers} />
      <div className="quiz-page fade-in take-test">
      <div className="quiz-header">
        <div className="quiz-info">
          <span className={`badge ${test.type === "IELTS" ? "badge-blue" : test.type === "TOEIC" ? "badge-green" : "badge-gray"}`}>{test.type}</span>
          <h2>{test.title}</h2>
          <p>{isPlacementMode ? "Placement test" : (test.part || "Full test")}</p>
        </div>
        <div className={`quiz-timer ${timeLeft !== null && timeLeft < 300 ? "take-test__timer--danger" : ""}`}>
          {timeLeft !== null && <><span>⏱</span><span className="timer-display">{formatCountdown(timeLeft)}</span></>}
        </div>
      </div>

      {test.description && <div className="quiz-instructions"><strong>{isPlacementMode ? "🎯 Mục tiêu:" : "📋 Mô tả:"}</strong> {test.description}</div>}

      <div className="questions-section">
        {questions.length === 0 && (
          <div className="empty-state">
            <p>Đề thi thử này hiện chưa có câu hỏi hiển thị. Bạn hãy quay lại và báo admin kiểm tra lại dữ liệu test.</p>
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
              {section.group?.imageUrl && <img src={section.group.imageUrl} alt="Test group" className="question-image" />}
              {section.group?.audioUrl && <audio controls src={section.group.audioUrl} className="take-test__group-audio" />}
              {section.group?.instructions && <p className="group-instructions">{section.group.instructions}</p>}
              {section.questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
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
        <p className="take-test__answered-count">Đã trả lời: {Object.keys(answers).length}/{questions.length} câu</p>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <span className="spinner" /> : isPlacementMode ? "Hoàn thành bài xếp lớp ✅" : "Nộp bài ✅"}
        </button>
      </div>
      </div>
    </div>
  );
}

function QuestionItem({ question, index, answers, onAnswer }) {
  const questionType = normalizeQuestionType(question.questionType);

  return (
    <div className="question-item" id={`question-${question.id}`}>
      <p className="question-content">
        <span className="q-num">{index + 1}.</span> {question.content}
      </p>
      {question.imageUrl && <img src={question.imageUrl} alt="Question" className="question-image" />}

      {questionType === "mcq" && (
        <div className="options-list">
          {["A", "B", "C", "D"].map((option) => {
            const value = question[`option${option}`];
            if (!value) {
              return null;
            }
            return (
              <label key={option} className={`option-item ${answers[question.id] === option ? "selected" : ""}`}>
                <input
                  type="radio"
                  name={`test_q_${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => onAnswer(question.id, option)}
                />
                <span className="option-letter">{option}</span>
                <span>{value}</span>
              </label>
            );
          })}
        </div>
      )}

      {questionType === "fill_blank" && (
        <input
          className="fill-blank-input"
          placeholder="Nhập câu trả lời..."
          value={answers[question.id] || ""}
          onChange={(event) => onAnswer(question.id, event.target.value)}
        />
      )}

      {["matching", "writing"].includes(questionType) && (
        <textarea
          className="writing-area"
          rows={questionType === "writing" ? 8 : 4}
          placeholder={questionType === "writing" ? "Viết câu trả lời tại đây..." : "Nhập câu trả lời..."}
          value={answers[question.id] || ""}
          onChange={(event) => onAnswer(question.id, event.target.value)}
        />
      )}
    </div>
  );
}
