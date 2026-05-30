import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Student.css";
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
        const [enrollmentResponse, assignmentResponse, quizResponse, quizSubmitResponse, assignmentSubmitResponse] = await Promise.all([
          api.get("/student/enrollments").catch(() => ({ data: { data: [] } })),
          api.get("/assignments").catch(() => ({ data: { data: [] } })),
          api.get("/quizzes").catch(() => ({ data: { data: [] } })),
          api.get(`/quizzes/submissions/user/${user.id}`).catch(() => ({ data: { data: [] } })),
          api.get(`/assignments/submit/user/${user.id}`).catch(() => ({ data: { data: [] } })),
        ]);

        const activeEnrollments = (enrollmentResponse.data.data || []).filter((item) =>
          ["approved", "enrolled", "completed"].includes(item.status)
        );
        const classIds = new Set(activeEnrollments.map((item) => Number(item.classId)).filter(Boolean));
        const allAssignments = (assignmentResponse.data.data || []).filter((assignment) => classIds.has(Number(assignment.classId)));
        const allQuizzes = (quizResponse.data.data || []).filter((quiz) => classIds.has(Number(quiz.classId)));
        const myQuizSubmissions = quizSubmitResponse.data.data || [];
        const myAssignmentSubmissions = assignmentSubmitResponse.data.data || [];

        setQuizzes(allQuizzes.map((quiz) => ({
          ...quiz,
          completed: myQuizSubmissions.some((submission) => Number(submission.quizId || submission.QuizID) === Number(quiz.id)),
          score: myQuizSubmissions.find((submission) => Number(submission.quizId || submission.QuizID) === Number(quiz.id))?.score ?? null,
        })));

        setAssignments(allAssignments.map((assignment) => ({
          ...assignment,
          submitted: myAssignmentSubmissions.some((submission) => Number(submission.assignId || submission.AssignID) === Number(assignment.id)),
          score: myAssignmentSubmissions.find((submission) => Number(submission.assignId || submission.AssignID) === Number(assignment.id))?.score ?? null,
          comment: myAssignmentSubmissions.find((submission) => Number(submission.assignId || submission.AssignID) === Number(assignment.id))?.comment ?? null,
        })));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const isExpired = (deadline) => deadline && new Date(deadline) < new Date();
  const isNearDeadline = (deadline) => {
    if (!deadline) {
      return false;
    }
    const diff = new Date(deadline) - new Date();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  };

  const handleSubmit = async () => {
    if (!submitContent.trim()) {
      toast.error("Nhập nội dung bài làm");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/assignments/${submitModal.id}/submit`, { content: submitContent });
      toast.success("Nộp bài thành công");
      setSubmitModal(null);
      setSubmitContent("");

      const response = await api.get(`/assignments/submit/user/${user.id}`).catch(() => ({ data: { data: [] } }));
      const mySubmissions = response.data.data || [];
      setAssignments((current) => current.map((assignment) => ({
        ...assignment,
        submitted: mySubmissions.some((submission) => Number(submission.AssignId || submission.assignId) === Number(assignment.id)),
        score: mySubmissions.find((submission) => Number(submission.AssignId || submission.assignId) === Number(assignment.id))?.score ?? null,
        comment: mySubmissions.find((submission) => Number(submission.AssignId || submission.assignId) === Number(assignment.id))?.comment ?? null,
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
              const expired = isExpired(assignment.deadline || assignment.HanNop);
              const nearDeadline = isNearDeadline(assignment.deadline || assignment.HanNop);
              const deadline = assignment.deadline || assignment.HanNop;

              return (
                <article
                  key={assignment.id}
                  className={`student-exercises__card ${expired ? "student-exercises__card--expired" : nearDeadline ? "student-exercises__card--warning" : "student-exercises__card--normal"}`}
                >
                  <div className="student-exercises__main">
                    <div className="student-exercises__badge-row">
                      <span className={`badge ${(assignment.examType || assignment.ExamType) === "IELTS" ? "badge-blue" : (assignment.examType || assignment.ExamType) === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                        {assignment.examType || assignment.ExamType}
                      </span>
                      <span className="badge badge-orange">{assignment.examPart || assignment.ExamPart || assignment.type || assignment.Loai}</span>
                      {nearDeadline && !expired && <span className="badge badge-yellow">⚠️ Sắp hết hạn</span>}
                      {expired && <span className="badge badge-red">❌ Hết hạn</span>}
                      {assignment.submitted && <span className="badge badge-green">✅ Đã nộp</span>}
                    </div>

                    <h4 className="student-exercises__title">{assignment.title || assignment.TieuDe}</h4>
                    <p className="student-exercises__description">
                      {(assignment.description || assignment.MoTa || "")?.slice(0, 120)}
                      {(assignment.description || assignment.MoTa || "")?.length > 120 ? "..." : ""}
                    </p>

                    <div className="student-exercises__meta">
                      <span>🏆 Điểm tối đa: {assignment.maxScore || assignment.DiemToiDa}</span>
                      {deadline && (
                        <span className={expired ? "student-exercises__meta-alert--danger" : nearDeadline ? "student-exercises__meta-alert--warning" : ""}>
                          ⏰ Hạn: {new Date(deadline).toLocaleString("vi-VN")}
                        </span>
                      )}
                      {assignment.score != null && <span className="student-exercises__score">Điểm: {assignment.score}/{assignment.maxScore || assignment.DiemToiDa}</span>}
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
                    <span className={`badge ${(quiz.examType || quiz.exam_type) === "IELTS" ? "badge-blue" : (quiz.examType || quiz.exam_type) === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                      {quiz.examType || quiz.exam_type}
                    </span>
                    <span className="badge badge-purple">{quiz.examPart || quiz.exam_part}</span>
                    {quiz.timeLimit && <span className="badge badge-yellow">⏱ {quiz.timeLimit} phút</span>}
                    {quiz.completed && <span className="badge badge-green">✅ Đã làm</span>}
                  </div>

                  <h4 className="student-exercises__title">{quiz.title || quiz.TieuDe}</h4>
                  {quiz.score != null && (
                    <p className="student-exercises__quiz-score">
                      Điểm: {quiz.score}/100
                      {(quiz.examType || quiz.exam_type) === "IELTS" && ` (Band ~${(quiz.score / 100 * 9).toFixed(1)})`}
                      {(quiz.examType || quiz.exam_type) === "TOEIC" && ` (~${Math.round(quiz.score / 100 * 990)}/990)`}
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
              <h3>📤 Nộp bài — {submitModal.title || submitModal.TieuDe}</h3>
              <button className="modal-close" onClick={() => setSubmitModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="student-exercises__prompt-box">{submitModal.description || submitModal.MoTa}</div>
              <div className="form-group">
                <label>Bài làm của bạn</label>
                <textarea
                  rows={8}
                  value={submitContent}
                  onChange={(event) => setSubmitContent(event.target.value)}
                  placeholder={(submitModal.type || submitModal.Loai) === "speaking" ? "Mô tả bài nói hoặc dán link recording..." : "Viết bài của bạn tại đây..."}
                  className="student-exercises__textarea"
                />
              </div>
              <p className="student-exercises__deadline">
                Hạn nộp: {submitModal.deadline || submitModal.HanNop ? new Date(submitModal.deadline || submitModal.HanNop).toLocaleString("vi-VN") : "Không giới hạn"}
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
