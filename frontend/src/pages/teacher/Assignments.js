import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { assignmentService } from "../../services/assignmentService";
import { classService } from "../../services/classService";
import { quizService } from "../../services/quizService";
import { userService } from "../../services/userService";
import { TEACHER_ASSIGNMENT_PAGE_SIZE } from "../../constants/pagination";
import { buildQuizSections, parseAnswerMap } from "../../utils/quiz";
import toast from "react-hot-toast";
import "./Assignments.css";

const IELTS_PARTS = ["Writing Task 1", "Writing Task 2", "Speaking Part 1", "Speaking Part 2", "Speaking Part 3"];
const TOEIC_PARTS = ["Speaking", "Writing"];
const INITIAL_FORM = {
  classId: "",
  title: "",
  description: "",
  type: "writing",
  examType: "IELTS",
  examPart: "",
  maxScore: 100,
  deadline: "",
};
const dedupeById = (items) => Array.from(
  new Map((items || []).map((item) => [item.id, item])).values()
);

function Pagination({ page, total, onChange }) {
  if (total <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <span className="pagination-info">Trang {page}/{total}</span>
      <div className="pagination-btns">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange((current) => current - 1)}>‹</button>
        {Array.from({ length: total }, (_, index) => (
          <button
            key={index + 1}
            className={`page-btn ${page === index + 1 ? "active" : ""}`}
            onClick={() => onChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button className="page-btn" disabled={page === total} onClick={() => onChange((current) => current + 1)}>›</button>
      </div>
    </div>
  );
}

export default function TeacherAssignments() {
  const { user } = useAuth();

  // State dữ liệu chính cho bài tập, quiz và người dùng liên quan.
  const [tab, setTab] = useState("assignments");
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [quizDetail, setQuizDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // State điều khiển modal, form và phân trang.
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [gradeForm, setGradeForm] = useState({ score: "", comment: "" });
  const [quizGradeForm, setQuizGradeForm] = useState({ score: "" });
  const [quizReviewModal, setQuizReviewModal] = useState(null);
  const [assignPage, setAssignPage] = useState(1);
  const [quizPage, setQuizPage] = useState(1);

  // Load dữ liệu khởi tạo cho teacher workspace.
  const fetchData = async () => {
    if (!user) {
      return;
    }

    setLoading(true);

    try {
      const [assignmentData, classData, userData, quizData] = await Promise.all([
        assignmentService.getTeacherAssignments(),
        classService.getTeacherClasses().catch(() => []),
        userService.getAll(),
        quizService.getTeacherQuizzes().catch(() => []),
      ]);

      setClasses(classData || []);
      setAssignments(assignmentData || []);
      setQuizzes(dedupeById(quizData || []));
      setUsers(userData || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const totalAssignPages = Math.max(1, Math.ceil(assignments.length / TEACHER_ASSIGNMENT_PAGE_SIZE));
  const paginatedAssignments = assignments.slice((assignPage - 1) * TEACHER_ASSIGNMENT_PAGE_SIZE, assignPage * TEACHER_ASSIGNMENT_PAGE_SIZE);
  const totalQuizPages = Math.max(1, Math.ceil(quizzes.length / TEACHER_ASSIGNMENT_PAGE_SIZE));
  const paginatedQuizzes = quizzes.slice((quizPage - 1) * TEACHER_ASSIGNMENT_PAGE_SIZE, quizPage * TEACHER_ASSIGNMENT_PAGE_SIZE);

  const getUserName = (id) => users.find((account) => account.id === id || account.id === Number(id))?.name || `ID: ${id}`;
  const getUserEmail = (id) => users.find((account) => account.id === id || account.id === Number(id))?.email || "";
  const getClassName = (id) => classes.find((classroom) => Number(classroom.id) === Number(id))?.name || `Lớp #${id}`;
  const getParts = () => (form.examType === "IELTS" ? IELTS_PARTS : TOEIC_PARTS);

  const summary = useMemo(() => ({
    assignments: assignments.length,
    quizzes: quizzes.length,
    pendingReview: submissions.filter((submission) => submission.score == null).length,
  }), [assignments.length, quizzes.length, submissions]);

  const loadSubmissions = async (assignmentId) => {
    try {
      const submissionData = await assignmentService.getSubmissions(assignmentId).catch(() => []);
      setSubmissions(submissionData || []);
    } catch {
      setSubmissions([]);
    }
  };

  const loadQuizResults = async (quizId) => {
    try {
      const resultData = await quizService.getTeacherQuizSubmissions(quizId).catch(() => []);
      setQuizResults(resultData || []);
    } catch {
      setQuizResults([]);
    }
  };

  const loadQuizDetail = async (quizId) => {
    try {
      const detail = await quizService.getFullQuiz(quizId).catch(() => null);
      setQuizDetail(detail);
      return detail;
    } catch {
      setQuizDetail(null);
      return null;
    }
  };

  const handleSave = async () => {
    if (!form.title) {
      toast.error("Nhập tiêu đề");
      return;
    }
    if (!form.classId) {
      toast.error("Chọn lớp học");
      return;
    }

    try {
      const payload = {
        ...form,
        classId: form.classId ? Number(form.classId) : null,
        maxScore: Number(form.maxScore),
      };

      if (modal === "add") {
        await assignmentService.createTeacherAssignment(payload);
      } else {
        await assignmentService.update(selected.id, payload);
      }

      toast.success(modal === "add" ? "Tạo bài tập thành công" : "Cập nhật thành công");
      setModal(null);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa bài tập này?")) {
      return;
    }

    try {
      await assignmentService.delete(id);
      toast.success("Đã xóa");
      setAssignments((current) => current.filter((assignment) => assignment.id !== id));
    } catch {
      toast.error("Không thể xóa");
    }
  };

  const handleGrade = async () => {
    if (!gradeForm.score) {
      toast.error("Nhập điểm");
      return;
    }

    try {
      await assignmentService.gradeSubmission(selected.submissionId, {
        score: Number(gradeForm.score),
        comment: gradeForm.comment,
      });

      toast.success("Chấm điểm thành công");
      setModal("submissions");
      await loadSubmissions(selected.assignId);
    } catch {
      toast.error("Thất bại");
    }
  };

  const handleQuizGrade = async () => {
    if (quizReviewModal == null || quizGradeForm.score === "") {
      toast.error("Nhập điểm bài làm");
      return;
    }

    try {
      await quizService.gradeTeacherSubmission(quizReviewModal.submission.id, {
        score: Number(quizGradeForm.score),
      });

      toast.success("Đã cập nhật điểm bài kiểm tra");
      await loadQuizResults(quizReviewModal.quiz.id);
      setQuizReviewModal(null);
    } catch {
      toast.error("Không thể lưu điểm");
    }
  };

  const openEditModal = (assignment) => {
    setForm({
      classId: assignment.classId || "",
      title: assignment.title,
      description: assignment.description || "",
      type: assignment.type,
      examType: assignment.examType,
      examPart: assignment.examPart || "",
      maxScore: assignment.maxScore,
      deadline: assignment.deadline ? assignment.deadline.slice(0, 16) : "",
    });
    setSelected(assignment);
    setModal("edit");
  };

  return (
    <div className="admin-page fade-in teacher-assignments">
      <section className="teacher-assignments__hero">
        <div>
          <p className="teacher-assignments__eyebrow">Assignment workspace</p>
          <h1>Bài tập & Bài kiểm tra</h1>
          <p className="teacher-assignments__subtitle">
            Tạo bài tập cho lớp phụ trách, xem bài nộp và theo dõi kết quả các bài kiểm tra do hệ thống cung cấp.
          </p>
        </div>
        <div className="teacher-assignments__hero-stats">
          <article className="teacher-assignments__stat">
            <span>Bài tập</span>
            <strong>{summary.assignments}</strong>
          </article>
          <article className="teacher-assignments__stat teacher-assignments__stat--accent">
            <span>Quiz khả dụng</span>
            <strong>{summary.quizzes}</strong>
          </article>
        </div>
      </section>
        <div className="toolbar">
          <div className="toolbar-left" />
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm(INITIAL_FORM);
              setModal("add");
            }}
          >
            + Tạo bài tập
          </button>
        </div>
        <div className="teacher-tabs">
          <button className={`ttab ${tab === "assignments" ? "active" : ""}`} onClick={() => setTab("assignments")}>
            📋 Bài tập ({assignments.length})
          </button>
          <button className={`ttab ${tab === "quizzes" ? "active" : ""}`} onClick={() => setTab("quizzes")}>
            📝 Bài kiểm tra ({quizzes.length})
          </button>
        </div>  
      {tab === "assignments" && (
        <>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : assignments.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài tập nào</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Phần</th>
                    <th>Điểm tối đa</th>
                    <th>Hạn nộp</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        <p className="teacher-assignments__title">{assignment.title}</p>
                        <p className="teacher-assignments__muted teacher-assignments__tiny">
                          {assignment.description?.slice(0, 60)}{assignment.description?.length > 60 ? "..." : ""}
                        </p>
                      </td>
                      <td>
                        <span className={`badge ${assignment.examType === "IELTS" ? "badge-blue" : assignment.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                          {assignment.examType}
                        </span>
                      </td>
                      <td className="teacher-assignments__tiny">{assignment.examPart || assignment.type || "—"}</td>
                      <td className="teacher-assignments__title">{assignment.maxScore}</td>
                      <td className="teacher-assignments__muted teacher-assignments__tiny">
                        {assignment.deadline
                          ? new Date(assignment.deadline).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td>
                        <span className={`badge ${assignment.status === "active" ? "badge-green" : assignment.status === "closed" ? "badge-gray" : "badge-red"}`}>
                          {assignment.status === "active" ? "Đang mở" : assignment.status === "closed" ? "Đã đóng" : "Ẩn"}
                        </span>
                      </td>
                      <td>
                        <div className="teacher-assignments__row-actions">
                          <button
                            className="btn btn-info btn-sm"
                            title="Xem bài nộp"
                            onClick={async () => {
                              setSelected({ ...assignment, assignId: assignment.id });
                              await loadSubmissions(assignment.id);
                              setModal("submissions");
                            }}
                          >
                            👁️
                          </button>
                          <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => openEditModal(assignment)}>✏️</button>
                          <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => handleDelete(assignment.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={assignPage} total={totalAssignPages} onChange={setAssignPage} />
            </div>
          )}
        </>
      )}

      {tab === "quizzes" && (
        <>
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state"><p>Chưa có bài kiểm tra nào</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Phần thi</th>
                    <th>Thời gian</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                    {paginatedQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                      <td>
                        <p className="teacher-assignments__title">{quiz.title}</p>
                        <p className="teacher-assignments__warning-note">Xem bài làm và chấm lại điểm nếu cần</p>
                      </td>
                      <td>
                        <span className={`badge ${quiz.examType === "IELTS" ? "badge-blue" : quiz.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                          {quiz.examType}
                        </span>
                      </td>
                      <td><span className="badge badge-purple">{quiz.examPart || "—"}</span></td>
                      <td className="teacher-assignments__tiny">{quiz.timeLimit ? `${quiz.timeLimit} phút` : "—"}</td>
                      <td>
                          <div className="teacher-assignments__row-actions">
                            <button
                              className="btn btn-info btn-sm"
                              title="Xem bài làm"
                              onClick={async () => {
                                setSelected(quiz);
                                await Promise.all([loadQuizResults(quiz.id), loadQuizDetail(quiz.id)]);
                                setModal("quiz-results");
                              }}
                            >
                              👁️
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={quizPage} total={totalQuizPages} onChange={setQuizPage} />
            </div>
          )}
        </>
      )}

      {/* Modal thêm hoặc sửa bài tập. */}
      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal teacher-assignments__modal-form" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "add" ? "Tạo bài tập mới" : "Chỉnh sửa bài tập"}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lớp học</label>
                <select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })}>
                  <option value="">— Chọn lớp phụ trách —</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Loại chứng chỉ</label>
                  <select value={form.examType} onChange={(event) => setForm({ ...form, examType: event.target.value, examPart: "" })}>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dạng bài</label>
                  <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
                    <option value="writing">✍️ Writing</option>
                    <option value="speaking">🎤 Speaking</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Phần thi cụ thể</label>
                <select value={form.examPart} onChange={(event) => setForm({ ...form, examPart: event.target.value })}>
                  <option value="">— Chọn phần —</option>
                  {getParts().map((part) => <option key={part} value={part}>{part}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề</label>
                <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Nhập tiêu đề bài tập..." />
              </div>
              <div className="form-group">
                <label>Đề bài / Nội dung</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder={
                    form.examPart === "Writing Task 2"
                      ? "Some people believe that... To what extent do you agree or disagree?"
                      : form.examPart === "Speaking Part 2"
                        ? "Talk about a place you have visited. You should say: where it is, when you went there..."
                        : "Nhập đề bài hoặc hướng dẫn làm bài..."
                  }
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Điểm tối đa</label>
                  <input
                    type="number"
                    value={form.maxScore}
                    onChange={(event) => setForm({ ...form, maxScore: event.target.value })}
                    min={0}
                    max={9}
                    step={form.examType === "IELTS" ? 0.5 : 1}
                  />
                </div>
                <div className="form-group">
                  <label>Hạn nộp bài</label>
                  <input type="datetime-local" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === "add" ? "Tạo bài tập" : "Lưu thay đổi"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem danh sách bài nộp của học viên. */}
      {modal === "submissions" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal teacher-assignments__modal-large" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Bài nộp — {selected?.title}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {submissions.length === 0 ? (
                <div className="empty-state"><p>Chưa có học viên nào nộp bài</p></div>
              ) : (
                submissions.map((submission) => (
                  <article key={submission.id} className="teacher-assignments__submission-item">
                    <div className="teacher-assignments__submission-main">
                      <div className="teacher-assignments__submission-user">
                        <div className="avatar teacher-assignments__avatar-small">
                          {getUserName(submission.userId)?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="teacher-assignments__title">{getUserName(submission.userId)}</p>
                          <p className="teacher-assignments__muted teacher-assignments__tiny">{getUserEmail(submission.userId)}</p>
                        </div>
                      </div>
                      <p className="teacher-assignments__muted teacher-assignments__tiny">
                        Nộp lúc: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("vi-VN") : "—"}
                      </p>
                      {submission.content && (
                        <div className="teacher-assignments__submission-content">
                          {submission.content?.slice(0, 200)}{submission.content?.length > 200 ? "..." : ""}
                        </div>
                      )}
                      {submission.comment && (
                        <div className="teacher-assignments__submission-comment">💬 Nhận xét: {submission.comment}</div>
                      )}
                    </div>
                    <div className="teacher-assignments__submission-side">
                      {submission.score !== null && submission.score !== undefined && (
                        <span className="badge badge-green">✅ {submission.score}/{selected?.maxScore}</span>
                      )}
                      <button
                        className="btn btn-primary btn-sm teacher-assignments__grade-btn"
                        onClick={() => {
                          setSelected((current) => ({ ...current, submissionId: submission.id }));
                          setGradeForm({
                            score: submission.score ?? "",
                            comment: submission.comment ?? "",
                          });
                          setModal("grade");
                        }}
                      >
                        ✏️ {submission.score !== null && submission.score !== undefined ? "Sửa điểm" : "Chấm điểm"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chấm điểm cho một submission. */}
      {modal === "grade" && (
        <div className="modal-overlay" onClick={() => setModal("submissions")}>
          <div className="modal teacher-assignments__modal-grade" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Chấm điểm</h3>
              <button className="modal-close" onClick={() => setModal("submissions")}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Điểm số (tối đa {selected?.maxScore})</label>
                <input
                  type="number"
                  value={gradeForm.score}
                  onChange={(event) => setGradeForm({ ...gradeForm, score: event.target.value })}
                  min={0}
                  max={selected?.maxScore}
                  step={selected?.examType === "IELTS" ? 0.5 : 1}
                  placeholder="Nhập điểm..."
                />
              </div>
              <div className="form-group">
                <label>Nhận xét chi tiết</label>
                <textarea
                  rows={5}
                  value={gradeForm.comment}
                  onChange={(event) => setGradeForm({ ...gradeForm, comment: event.target.value })}
                  placeholder="VD: Task Achievement: 7.0. Coherence: 6.5..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal("submissions")}>Quay lại</button>
              <button className="btn btn-primary" onClick={handleGrade}>✅ Lưu điểm</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem kết quả quiz mà teacher được phép đọc. */}
      {modal === "quiz-results" && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal teacher-assignments__modal-result" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Bài làm — {selected?.title}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {quizResults.length === 0 ? (
                <div className="empty-state"><p>Chưa có học viên nào làm bài</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Học viên</th>
                      <th>Điểm</th>
                      <th>Band / Score</th>
                      <th>Thời gian nộp</th>
                      <th>Xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizResults.map((result) => (
                      <tr key={result.id}>
                        <td>
                          <p className="teacher-assignments__title teacher-assignments__title--compact">{getUserName(result.userId)}</p>
                          <p className="teacher-assignments__muted teacher-assignments__tiny">{getUserEmail(result.userId)}</p>
                        </td>
                        <td>
                          <span className={`badge ${Number(result.score) >= 70 ? "badge-green" : Number(result.score) >= 50 ? "badge-yellow" : "badge-red"}`}>
                            {result.score}/100
                          </span>
                        </td>
                        <td className="teacher-assignments__tiny teacher-assignments__muted">
                          {selected?.examType === "IELTS" && `Band ${(Number(result.score) / 100 * 9).toFixed(1)}`}
                          {selected?.examType === "TOEIC" && `~${Math.round(Number(result.score) / 100 * 990)}/990`}
                        </td>
                        <td className="teacher-assignments__tiny teacher-assignments__muted">
                          {result.submittedAt ? new Date(result.submittedAt).toLocaleString("vi-VN") : "—"}
                        </td>
                        <td>
                          <div className="teacher-assignments__row-actions">
                            <button
                              className="btn btn-ghost btn-sm"
                              title="Xem và chấm bài"
                              onClick={async () => {
                                const detail = quizDetail?.quiz?.id === selected?.id
                                  ? quizDetail
                                  : await loadQuizDetail(selected.id);

                                setQuizGradeForm({ score: result.score ?? "" });
                                setQuizReviewModal({
                                  quiz: selected,
                                  submission: result,
                                  answerMap: parseAnswerMap(result.answers),
                                  detail,
                                });
                              }}
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {quizReviewModal && (
        <div className="modal-overlay" onClick={() => setQuizReviewModal(null)}>
          <div className="modal teacher-assignments__modal-review" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Xem và chấm bài kiểm tra</h3>
              <button className="modal-close" onClick={() => setQuizReviewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="teacher-assignments__review-summary">
                <span>{getUserName(quizReviewModal.submission.userId)}</span>
                <span>{selected?.title}</span>
              </div>
              {((quizReviewModal.detail?.questions || quizDetail?.questions || []).length === 0) && (
                <div className="empty-state"><p>Chưa tải được danh sách câu hỏi của bài kiểm tra này</p></div>
              )}
              {buildQuizSections(
                quizReviewModal.detail?.groups || quizDetail?.groups,
                quizReviewModal.detail?.questions || quizDetail?.questions,
              ).map((section, sectionIndex, allSections) => {
                const previousQuestionCount = allSections
                  .slice(0, sectionIndex)
                  .reduce((total, currentSection) => total + currentSection.questions.length, 0);

                return (
                <section key={section.key} className="teacher-assignments__review-section">
                  {section.group && (
                    <div className="teacher-assignments__submission-content">
                      {section.group.title && <p className="teacher-assignments__title teacher-assignments__title--compact">{section.group.title}</p>}
                      {section.group.instructions && <p>{section.group.instructions}</p>}
                      {section.group.passageText && <p>{section.group.passageText}</p>}
                      {section.group.imageUrl && <img src={section.group.imageUrl} alt="Question group" className="question-image" />}
                      {section.group.audioUrl && <audio controls src={section.group.audioUrl} />}
                    </div>
                  )}
                  {section.questions.map((question, index) => {
                    const answer = quizReviewModal.answerMap[String(question.id)] ?? quizReviewModal.answerMap[question.id];
                    return (
                      <article key={question.id} className="teacher-assignments__question-review">
                        <p className="teacher-assignments__title teacher-assignments__title--compact">{previousQuestionCount + index + 1}. {question.content}</p>
                        {question.imageUrl && <img src={question.imageUrl} alt="Question" className="question-image" />}
                        {question.questionType === "mcq" ? (
                          <div className="teacher-assignments__answer-list">
                            {["A", "B", "C", "D"].map((option) => {
                              const value = question[`option${option}`];
                              if (!value) {
                                return null;
                              }
                              return (
                                <div
                                  key={option}
                                  className={`teacher-assignments__answer-item ${answer === option ? "teacher-assignments__answer-item--chosen" : ""} ${question.correctAnswer === option ? "teacher-assignments__answer-item--correct" : ""}`}
                                >
                                  <strong>{option}.</strong> {value}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="teacher-assignments__submission-content">
                            {answer || "Chưa trả lời"}
                          </div>
                        )}
                        {question.correctAnswer && question.questionType !== "writing" && (
                          <p className="teacher-assignments__tiny teacher-assignments__muted">Đáp án đúng: <strong>{question.correctAnswer}</strong></p>
                        )}
                      </article>
                    );
                  })}
                </section>
              );
              })}

              <div className="form-group">
                <label>Điểm bài làm</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quizGradeForm.score}
                  onChange={(event) => setQuizGradeForm({ score: event.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setQuizReviewModal(null)}>Đóng</button>
              <button className="btn btn-primary" onClick={handleQuizGrade}>Lưu điểm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
