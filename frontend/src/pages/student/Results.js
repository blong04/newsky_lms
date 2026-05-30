import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Student.css";
import "./Results.css";

// Parse đáp án cũ và mới để màn xem lại bài làm đọc được cả dữ liệu đã lưu trước/sau khi refactor.
const parseAnswerMap = (rawAnswers) => {
  if (!rawAnswers) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawAnswers);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return String(rawAnswers)
      .split("|")
      .filter(Boolean)
      .reduce((answerMap, pair) => {
        const [questionId, value] = pair.split(":");
        if (questionId) {
          answerMap[questionId] = value ?? "";
        }
        return answerMap;
      }, {});
  }
};

export default function StudentResults() {
  const { user } = useAuth();

  // State nguồn dữ liệu kết quả bài tập và bài kiểm tra.
  const [tab, setTab] = useState("assignments");
  const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);
  const [quizSubmissions, setQuizSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAll = async () => {
      setLoading(true);

      try {
        const [assignmentSubmissionResponse, quizSubmissionResponse, assignmentResponse, quizResponse] = await Promise.all([
          api.get(`/assignments/submit/user/${user.id}`).catch(() => ({ data: { data: [] } })),
          api.get(`/quizzes/submissions/user/${user.id}`).catch(() => ({ data: { data: [] } })),
          api.get("/assignments").catch(() => ({ data: { data: [] } })),
          api.get("/quizzes").catch(() => ({ data: { data: [] } })),
        ]);

        setAssignmentSubmissions(assignmentSubmissionResponse.data.data || []);
        setQuizSubmissions(quizSubmissionResponse.data.data || []);
        setAssignments(assignmentResponse.data.data || []);
        setQuizzes(quizResponse.data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const getAssignment = (id) => assignments.find((assignment) => Number(assignment.id) === Number(id));
  const getQuiz = (id) => quizzes.find((quiz) => Number(quiz.id) === Number(id));

  const openAssignmentReview = (submission) => {
    const assignment = getAssignment(submission.assignId || submission.AssignID);
    setReviewModal({
      type: "assignment",
      assignment,
      submission,
    });
  };

  const openQuizReview = async (submission) => {
    const quizId = submission.quizId || submission.QuizID;
    const quiz = getQuiz(quizId);
    setReviewLoading(true);

    try {
      const response = await api.get(`/quizzes/${quizId}/full`);
      const quizDetail = response.data.data;
      setReviewModal({
        type: "quiz",
        quiz,
        submission,
        quizDetail,
        answerMap: parseAnswerMap(submission.answers),
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải nội dung bài làm");
    } finally {
      setReviewLoading(false);
    }
  };

  const scoreColorClass = (score, max) => {
    if (score == null) {
      return "student-results__score--muted";
    }

    const percent = (score / (max || 100)) * 100;
    if (percent >= 75) {
      return "student-results__score--good";
    }
    if (percent >= 50) {
      return "student-results__score--mid";
    }
    return "student-results__score--low";
  };

  const quizAverage = useMemo(() => (
    quizSubmissions.length > 0
      ? (quizSubmissions.reduce((sum, item) => sum + Number(item.score || item.Diem || 0), 0) / quizSubmissions.length).toFixed(1)
      : "—"
  ), [quizSubmissions]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-results">
      <section className="student-results__hero">
        <div>
          <p className="student-results__eyebrow">Performance</p>
          <h1>Kết quả học tập</h1>
          <p className="student-results__subtitle">Tổng hợp điểm bài tập, bài kiểm tra và các nhận xét mà bạn đã nhận trong quá trình học.</p>
        </div>
      </section>

      {/* Các chỉ số tổng quan đầu trang. */}
      <div className="stats-grid student-results__stats">
        <article className="stat-card student-results__stat-card student-results__stat-card--assignments">
          <div className="stat-icon">📋</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã nộp</p>
            <h3 className="stat-value">{assignmentSubmissions.length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--graded">
          <div className="stat-icon">✅</div>
          <div className="stat-body">
            <p className="stat-label">Bài tập đã chấm</p>
            <h3 className="stat-value">{assignmentSubmissions.filter((item) => item.status === "graded" || item.TrangThai === "graded").length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--quizzes">
          <div className="stat-icon">📝</div>
          <div className="stat-body">
            <p className="stat-label">Bài kiểm tra đã làm</p>
            <h3 className="stat-value">{quizSubmissions.length}</h3>
          </div>
        </article>
        <article className="stat-card student-results__stat-card student-results__stat-card--average">
          <div className="stat-icon">📊</div>
          <div className="stat-body">
            <p className="stat-label">Điểm TB bài kiểm tra</p>
            <h3 className="stat-value">{quizAverage}</h3>
          </div>
        </article>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab-btn ${tab === "assignments" ? "active" : ""}`} onClick={() => setTab("assignments")}>
          📋 Bài tập ({assignmentSubmissions.length})
        </button>
        <button className={`filter-tab-btn ${tab === "quizzes" ? "active" : ""}`} onClick={() => setTab("quizzes")}>
          📝 Bài kiểm tra ({quizSubmissions.length})
        </button>
      </div>

      {tab === "assignments" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài tập</th>
                <th>Loại / Part</th>
                <th>Ngày nộp</th>
                <th>Điểm</th>
                <th>Nhận xét</th>
                <th>Trạng thái</th>
                <th>Xem lại</th>
              </tr>
            </thead>
            <tbody>
              {assignmentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Chưa có bài tập nào được nộp</p></td>
                </tr>
              ) : (
                assignmentSubmissions.map((submission) => {
                  const assignment = getAssignment(submission.assignId || submission.AssignID);
                  const score = submission.score ?? submission.Diem ?? null;
                  const maxScore = assignment?.maxScore || assignment?.DiemToiDa || 100;
                  const status = submission.status || submission.TrangThai;
                  const graded = status === "graded";

                  return (
                    <tr key={submission.id || submission.SubmitID}>
                      <td><p className="student-results__item-title">{assignment?.title || assignment?.TieuDe || `Bài tập #${submission.assignId || submission.AssignID}`}</p></td>
                      <td>
                        <div className="student-results__badge-list">
                          {(assignment?.examType || assignment?.ExamType) && (
                            <span className={`badge ${(assignment?.examType || assignment?.ExamType) === "IELTS" ? "badge-blue" : "badge-green"}`}>
                              {assignment?.examType || assignment?.ExamType}
                            </span>
                          )}
                          {(assignment?.examPart || assignment?.ExamPart || assignment?.Part) && (
                            <span className="badge badge-gray">{assignment?.examPart || assignment?.ExamPart || assignment?.Part}</span>
                          )}
                        </div>
                      </td>
                      <td className="student-results__muted student-results__tiny">
                        {(submission.submittedAt || submission.NgayNop)
                          ? new Date(submission.submittedAt || submission.NgayNop).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        {graded && score != null ? (
                          <div>
                            <span className={`student-results__score ${scoreColorClass(score, maxScore)}`}>{score}</span>
                            <span className="student-results__score-denominator">/{maxScore}</span>
                            {(assignment?.examType || assignment?.ExamType) === "IELTS" && maxScore <= 9 && (
                              <p className="student-results__tiny student-results__muted">Band {Number(score).toFixed(1)}</p>
                            )}
                          </div>
                        ) : (
                          <span className="student-results__muted student-results__tiny">—</span>
                        )}
                      </td>
                      <td className="student-results__comment-cell">
                        {(submission.comment || submission.NhanXet)
                          ? <p className="student-results__comment">{submission.comment || submission.NhanXet}</p>
                          : <span className="student-results__muted student-results__tiny">—</span>}
                      </td>
                      <td>
                        <span className={`badge ${graded ? "badge-green" : "badge-yellow"}`}>{graded ? "✅ Đã chấm" : "⏳ Chờ chấm"}</span>
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openAssignmentReview(submission)}>👁️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "quizzes" && (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bài kiểm tra</th>
                <th>Loại</th>
                <th>Ngày làm</th>
                <th>Điểm</th>
                <th>Band / Score ước tính</th>
                <th>Thời gian làm</th>
                <th>Xem lại</th>
              </tr>
            </thead>
            <tbody>
              {quizSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Chưa có bài kiểm tra nào được hoàn thành</p></td>
                </tr>
              ) : (
                quizSubmissions.map((submission) => {
                  const quiz = getQuiz(submission.quizId || submission.QuizID);
                  const score = Number(submission.score || submission.Diem || 0);
                  const exam = quiz?.examType || quiz?.exam_type || "";
                  const mins = submission.timeSpent || submission.ThoiGianLam
                    ? Math.floor((submission.timeSpent || submission.ThoiGianLam) / 60)
                    : null;

                  return (
                    <tr key={submission.id || submission.SubmissionID}>
                      <td>
                        <p className="student-results__item-title">{quiz?.title || quiz?.TieuDe || `Quiz #${submission.quizId || submission.QuizID}`}</p>
                        {(quiz?.examPart || quiz?.exam_part) && (
                          <p className="student-results__tiny student-results__muted">{quiz?.examPart || quiz?.exam_part}</p>
                        )}
                      </td>
                      <td>
                        {exam && (
                          <span className={`badge ${exam === "IELTS" ? "badge-blue" : exam === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                            {exam}
                          </span>
                        )}
                      </td>
                      <td className="student-results__muted student-results__tiny">
                        {(submission.submittedAt || submission.NgayNop)
                          ? new Date(submission.submittedAt || submission.NgayNop).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>
                      <td>
                        <span className={`student-results__score ${scoreColorClass(score, 100)}`}>{score.toFixed(1)}</span>
                        <span className="student-results__score-denominator">/100</span>
                      </td>
                      <td>
                        {exam === "IELTS" && <span className="student-results__estimate student-results__estimate--ielts">Band {(score / 100 * 9).toFixed(1)}</span>}
                        {exam === "TOEIC" && <span className="student-results__estimate student-results__estimate--toeic">~{Math.round(score / 100 * 990)}/990</span>}
                      </td>
                      <td className="student-results__muted student-results__tiny">{mins != null ? `${mins} phút` : "—"}</td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openQuizReview(submission)}>👁️</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {reviewLoading && (
        <div className="modal-overlay">
          <div className="modal student-results__review-loading">
            <div className="page-loading"><div className="spinner" /></div>
          </div>
        </div>
      )}

      {reviewModal?.type === "assignment" && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal student-results__review-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem lại bài tập</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-results__item-title">{reviewModal.assignment?.title || "Bài tập"}</p>
              {reviewModal.assignment?.description && (
                <div className="student-results__review-box">{reviewModal.assignment.description}</div>
              )}
              <div className="student-results__review-meta">
                <span>Ngày nộp: {reviewModal.submission.submittedAt ? new Date(reviewModal.submission.submittedAt).toLocaleString("vi-VN") : "—"}</span>
                <span>Điểm: {reviewModal.submission.score ?? "Chưa chấm"}</span>
              </div>
              <div className="student-results__review-box">
                {reviewModal.submission.content || "Chưa có nội dung bài làm."}
              </div>
              {reviewModal.submission.comment && (
                <div className="student-results__review-comment">Nhận xét: {reviewModal.submission.comment}</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal?.type === "quiz" && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal student-results__review-modal student-results__review-modal--wide" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem lại bài kiểm tra</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-results__item-title">{reviewModal.quiz?.title || "Bài kiểm tra"}</p>
              <div className="student-results__review-meta">
                <span>Điểm: {reviewModal.submission.score ?? 0}/100</span>
                <span>Thời gian làm: {reviewModal.submission.timeSpent ? `${Math.floor(reviewModal.submission.timeSpent / 60)} phút` : "—"}</span>
              </div>
              {(reviewModal.quizDetail?.questions || []).map((question, index) => {
                const answer = reviewModal.answerMap[String(question.id)] ?? reviewModal.answerMap[question.id];
                return (
                  <article key={question.id} className="student-results__question-review">
                    <p className="student-results__question-title">{index + 1}. {question.content}</p>
                    {question.imageUrl && <img className="student-results__question-image" src={question.imageUrl} alt="Question" />}
                    {question.questionType === "mcq" && (
                      <div className="student-results__answer-list">
                        {["A", "B", "C", "D"].map((option) => {
                          const value = question[`option${option}`];
                          if (!value) {
                            return null;
                          }
                          const isChosen = answer === option;
                          const isCorrect = question.correctAnswer === option;
                          return (
                            <div key={option} className={`student-results__answer-item ${isChosen ? "student-results__answer-item--chosen" : ""} ${isCorrect ? "student-results__answer-item--correct" : ""}`}>
                              <strong>{option}.</strong> {value}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {question.questionType !== "mcq" && (
                      <div className="student-results__review-box">
                        Câu trả lời của bạn: {answer || "Chưa trả lời"}
                      </div>
                    )}
                    {question.correctAnswer && question.questionType !== "writing" && (
                      <p className="student-results__tiny student-results__muted">
                        Đáp án đúng: <strong>{question.correctAnswer}</strong>
                      </p>
                    )}
                    {question.explanation && (
                      <p className="student-results__review-explanation">{question.explanation}</p>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setReviewModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
