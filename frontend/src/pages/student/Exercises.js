import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { assignmentService } from "../../services/assignmentService";
import { enrollmentService } from "../../services/enrollmentService";
import { quizService } from "../../services/quizService";
import { ACTIVE_ENROLLMENT_STATUSES } from "../../constants/enrollments";
import { buildMapByNumericField } from "../../utils/collection";
import { isDeadlineExpired, isDeadlineNear } from "../../utils/schedule";
import toast from "react-hot-toast";
import "./Exercises.css";

export default function StudentExercises() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State dữ liệu cho bài tập, quiz và form nộp bài.
  const [tab, setTab] = useState("assignments");
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitModal, setSubmitModal] = useState(null);
  const [submitContent, setSubmitContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [enrollmentData, assignmentData, quizData, quizSubmitData, assignmentSubmitData] = await Promise.all([
          enrollmentService.getStudentEnrollments().catch(() => []),
          assignmentService.getAll().catch(() => []),
          quizService.getAll().catch(() => []),
          quizService.getUserSubmissions(user.id).catch(() => []),
          assignmentService.getUserSubmissions(user.id).catch(() => []),
        ]);

        const activeEnrollments = (enrollmentData || []).filter((item) =>
          ACTIVE_ENROLLMENT_STATUSES.includes(item.status)
        );
        const classIds = new Set(activeEnrollments.map((item) => Number(item.classId)).filter(Boolean));
        const allAssignments = (assignmentData || []).filter((assignment) => classIds.has(Number(assignment.classId)));
        const allQuizzes = (quizData || []).filter((quiz) => classIds.has(Number(quiz.classId)));
        const myQuizSubmissions = quizSubmitData || [];
        const myAssignmentSubmissions = assignmentSubmitData || [];
        const quizSubmissionMap = buildMapByNumericField(myQuizSubmissions, "quizId");
        const assignmentSubmissionMap = buildMapByNumericField(myAssignmentSubmissions, "assignId");

        setQuizzes(allQuizzes.map((quiz) => ({
          ...quiz,
          completed: Boolean(quizSubmissionMap[Number(quiz.id)]),
          score: quizSubmissionMap[Number(quiz.id)]?.score ?? null,
        })));

        setAssignments(allAssignments.map((assignment) => ({
          ...assignment,
          submitted: Boolean(assignmentSubmissionMap[Number(assignment.id)]),
          score: assignmentSubmissionMap[Number(assignment.id)]?.score ?? null,
          comment: assignmentSubmissionMap[Number(assignment.id)]?.comment ?? null,
        })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const handleSubmit = async () => {
    if (!submitContent.trim()) {
      toast.error("Nhập nội dung bài làm");
      return;
    }

    setSubmitting(true);
    try {
      await assignmentService.submit(submitModal.id, { content: submitContent });
      toast.success("Nộp bài thành công");
      setSubmitModal(null);
      setSubmitContent("");

      const mySubmissions = await assignmentService.getUserSubmissions(user.id).catch(() => []);
      const assignmentSubmissionMap = buildMapByNumericField(mySubmissions, "assignId");
      setAssignments((current) => current.map((assignment) => ({
        ...assignment,
        submitted: Boolean(assignmentSubmissionMap[Number(assignment.id)]),
        score: assignmentSubmissionMap[Number(assignment.id)]?.score ?? null,
        comment: assignmentSubmissionMap[Number(assignment.id)]?.comment ?? null,
      })));
    } catch {
      toast.error("Không thể nộp bài");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-exercises">
      <div className="page-header">
        <h1>Bài tập & Kiểm tra</h1>
        <p>Bài tập và bài kiểm tra từ các lớp bạn đang học</p>
      </div>

      <div className="filter-tabs">
        <button className={`filter-tab-btn ${tab === "assignments" ? "active" : ""}`} onClick={() => setTab("assignments")}>📋 Bài tập</button>
        <button className={`filter-tab-btn ${tab === "quizzes" ? "active" : ""}`} onClick={() => setTab("quizzes")}>📝 Bài kiểm tra</button>
      </div>

      {tab === "assignments" && (
        <div className="student-exercises__stack">
          {assignments.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài tập nào</p></div>
          ) : (
            assignments.map((assignment) => {
              const expired = isDeadlineExpired(assignment.deadline);
              const nearDeadline = isDeadlineNear(assignment.deadline);
              const deadline = assignment.deadline;

              return (
                <article
                  key={assignment.id}
                  className={`student-exercises__card ${expired ? "student-exercises__card--expired" : nearDeadline ? "student-exercises__card--warning" : "student-exercises__card--normal"}`}
                >
                  <div className="student-exercises__main">
                    <div className="student-exercises__badge-row">
                      <span className={`badge ${assignment.examType === "IELTS" ? "badge-blue" : assignment.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                        {assignment.examType || "Khác"}
                      </span>
                      <span className="badge badge-orange">{assignment.examPart || assignment.type || "Bài tập"}</span>
                      {nearDeadline && !expired && <span className="badge badge-yellow">⚠️ Sắp hết hạn</span>}
                      {expired && <span className="badge badge-red">❌ Hết hạn</span>}
                      {assignment.submitted && <span className="badge badge-green">✅ Đã nộp</span>}
                    </div>

                    <h4 className="student-exercises__title">{assignment.title}</h4>
                    <p className="student-exercises__description">
                      {(assignment.description || "")?.slice(0, 120)}
                      {(assignment.description || "")?.length > 120 ? "..." : ""}
                    </p>

                    <div className="student-exercises__meta">
                      <span>🏆 Điểm tối đa: {assignment.maxScore}</span>
                      {deadline && (
                        <span className={expired ? "student-exercises__meta-alert--danger" : nearDeadline ? "student-exercises__meta-alert--warning" : ""}>
                          ⏰ Hạn: {new Date(deadline).toLocaleString("vi-VN")}
                        </span>
                      )}
                      {assignment.score != null && <span className="student-exercises__score">Điểm: {assignment.score}/{assignment.maxScore}</span>}
                    </div>

                    {assignment.comment && <div className="student-exercises__comment">💬 Nhận xét: {assignment.comment}</div>}
                  </div>

                  <div>
                    {!assignment.submitted && !expired && (
                      <button className="btn btn-primary btn-sm" onClick={() => { setSubmitModal(assignment); setSubmitContent(""); }}>📤 Nộp bài</button>
                    )}
                    {assignment.submitted && assignment.score == null && <span className="student-exercises__pending-grade">Chờ chấm</span>}
                  </div>
                </article>
              );
            })
          )}
        </div>
      )}

      {tab === "quizzes" && (
        <div className="student-exercises__stack">
          {quizzes.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài kiểm tra nào</p></div>
          ) : (
            quizzes.map((quiz) => (
              <article key={quiz.id} className="student-exercises__card student-exercises__card--normal">
                <div className="student-exercises__main">
                  <div className="student-exercises__badge-row">
                    <span className={`badge ${quiz.examType === "IELTS" ? "badge-blue" : quiz.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                      {quiz.examType || "Khác"}
                    </span>
                    <span className="badge badge-purple">{quiz.examPart || "Quiz"}</span>
                    {quiz.timeLimit && <span className="badge badge-yellow">⏱ {quiz.timeLimit} phút</span>}
                    {quiz.completed && <span className="badge badge-green">✅ Đã làm</span>}
                  </div>

                  <h4 className="student-exercises__title">{quiz.title}</h4>
                  {quiz.score != null && (
                    <p className="student-exercises__quiz-score">
                      Điểm: {quiz.score}/100
                      {quiz.examType === "IELTS" && ` (Band ~${(quiz.score / 100 * 9).toFixed(1)})`}
                      {quiz.examType === "TOEIC" && ` (~${Math.round(quiz.score / 100 * 990)}/990)`}
                    </p>
                  )}
                </div>

                <div>
                  {quiz.completed ? (
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate("/student/results")}>Xem lại</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/quiz/${quiz.id}`)}>Làm bài →</button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Modal nhập bài làm trước khi gửi lên backend. */}
      {submitModal && (
        <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="modal student-exercises__submit-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Nộp bài — {submitModal.title}</h3>
              <button className="modal-close" onClick={() => setSubmitModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="student-exercises__prompt-box">{submitModal.description}</div>
              <div className="form-group">
                <label>Bài làm của bạn</label>
                <textarea
                  rows={8}
                  value={submitContent}
                  onChange={(event) => setSubmitContent(event.target.value)}
                  placeholder={submitModal.type === "speaking" ? "Mô tả bài nói hoặc dán link recording..." : "Viết bài của bạn tại đây..."}
                  className="student-exercises__textarea"
                />
              </div>
              <p className="student-exercises__deadline">
                Hạn nộp: {submitModal.deadline ? new Date(submitModal.deadline).toLocaleString("vi-VN") : "Không giới hạn"}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSubmitModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="spinner" /> : "📤 Nộp bài"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
