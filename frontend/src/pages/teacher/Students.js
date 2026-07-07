import React, { useEffect, useMemo, useState } from "react";
import { assignmentService } from "../../services/assignmentService";
import { classService } from "../../services/classService";
import { ENROLLMENT_STATUS_BADGES, ENROLLMENT_STATUS_LABELS } from "../../constants/enrollments";
import { getExamBadgeClass } from "../../constants/courses";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import { quizService } from "../../services/quizService";
import { testService } from "../../services/testService";
import { getLinkedClassIds, hasAnyLinkedClass } from "../../utils/assessment";
import toast from "react-hot-toast";
import "./Students.css";

export default function TeacherStudents() {
  // State dữ liệu cho bộ lọc học viên theo khóa và lớp.
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [assignmentCatalog, setAssignmentCatalog] = useState([]);
  const [quizCatalog, setQuizCatalog] = useState([]);
  const [testCatalog, setTestCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển giao diện và phân trang.
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailModal, setDetailModal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const [myClasses, teacherAssignments, teacherQuizzes, teacherTests] = await Promise.all([
          classService.getTeacherClasses(),
          assignmentService.getTeacherAssignments().catch(() => []),
          quizService.getTeacherQuizzes().catch(() => []),
          testService.getTeacherTests().catch(() => []),
        ]);
        setClasses(myClasses);
        setAssignmentCatalog(teacherAssignments || []);
        setQuizCatalog(teacherQuizzes || []);
        setTestCatalog(teacherTests || []);

        const enrollmentResponses = await Promise.all(
          myClasses.map((classroom) =>
            classService.getTeacherClassStudents(classroom.id)
              .then((response) => response || [])
              .catch(() => [])
          )
        );

        setEnrollments(enrollmentResponses.flat());
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu học viên");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const myCourses = useMemo(() => {
    const courseMap = new Map();
    classes.forEach((classroom) => {
      if (classroom.courseId && !courseMap.has(classroom.courseId)) {
        courseMap.set(classroom.courseId, {
          id: classroom.courseId,
          title: classroom.courseName || `Khóa #${classroom.courseId}`,
          examType: classroom.examType || "",
        });
      }
    });
    return Array.from(courseMap.values());
  }, [classes]);

  const filteredClasses = selectedCourse
    ? classes.filter((classroom) => Number(classroom.courseId) === Number(selectedCourse))
    : classes;

  // Tập học viên cuối cùng sau khi đã áp dụng tìm kiếm và dropdown filters.
  const filteredEnrollments = useMemo(() => (
    enrollments.filter((enrollment) => {
      const matchSearch = !search
        || (enrollment.userName || "").toLowerCase().includes(search.toLowerCase())
        || (enrollment.userEmail || "").toLowerCase().includes(search.toLowerCase());
      const matchCourse = !selectedCourse || Number(enrollment.courseId) === Number(selectedCourse);
      const matchClass = !selectedClass || Number(enrollment.classId) === Number(selectedClass);

      return matchSearch && matchCourse && matchClass;
    })
  ), [enrollments, search, selectedCourse, selectedClass]);

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedEnrollments = filteredEnrollments.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);
  const assignmentMap = useMemo(() => (
    Object.fromEntries((assignmentCatalog || []).map((assignment) => [Number(assignment.id), assignment]))
  ), [assignmentCatalog]);
  const quizMap = useMemo(() => (
    Object.fromEntries((quizCatalog || []).map((quiz) => [Number(quiz.id), quiz]))
  ), [quizCatalog]);
  const testMap = useMemo(() => (
    Object.fromEntries((testCatalog || []).map((test) => [Number(test.id), test]))
  ), [testCatalog]);

  const openStudentDetail = async (enrollment) => {
    setDetailLoading(true);
    setDetailModal({
      enrollment,
      assignments: [],
      quizzes: [],
      tests: [],
    });

    try {
      const [assignmentSubmissions, quizSubmissions, testSubmissions] = await Promise.all([
        assignmentService.getTeacherStudentSubmissions(enrollment.userId).catch(() => []),
        quizService.getTeacherStudentSubmissions(enrollment.userId).catch(() => []),
        testService.getTeacherStudentSubmissions(enrollment.userId).catch(() => []),
      ]);
      const selectedClassId = Number(enrollment.classId);
      const classScope = new Set(selectedClassId ? [selectedClassId] : []);
      const filteredAssignments = (assignmentSubmissions || []).filter((submission) => {
        const assignment = assignmentMap[Number(submission.assignId)];
        if (!assignment || !selectedClassId) {
          return true;
        }
        return Number(assignment.classId) === selectedClassId;
      });
      const filteredQuizzes = (quizSubmissions || []).filter((submission) => {
        const quiz = quizMap[Number(submission.quizId)];
        if (!quiz || classScope.size === 0) {
          return true;
        }
        return hasAnyLinkedClass(quiz, classScope);
      });
      const filteredTests = (testSubmissions || []).filter((submission) => {
        const test = testMap[Number(submission.testId)];
        if (!test || classScope.size === 0) {
          return true;
        }
        return hasAnyLinkedClass(test, classScope);
      });

      setDetailModal({
        enrollment,
        assignments: filteredAssignments,
        quizzes: filteredQuizzes,
        tests: filteredTests,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải lịch sử nộp bài của học viên");
      setDetailModal(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="admin-page fade-in teacher-students">
      <section className="teacher-students__hero">
        <div>
          <p className="teacher-students__eyebrow">Student directory</p>
          <h1>Học viên</h1>
          <p className="teacher-students__subtitle">
            Xem toàn bộ học viên đã được duyệt trong các lớp phụ trách, lọc theo khóa học và theo dõi tiến độ nhanh.
          </p>
        </div>
        <div className="teacher-students__hero-card">
          <span>Đang hiển thị</span>
          <strong>{filteredEnrollments.length} học viên</strong>
          <p>{classes.length} lớp đang được dùng làm nguồn lọc dữ liệu.</p>
        </div>
      </section>

      <div className="toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="🔍 Tìm tên hoặc email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="filter-select"
            value={selectedCourse}
            onChange={(event) => {
              setSelectedCourse(event.target.value);
              setSelectedClass("");
              setPage(1);
            }}
          >
            <option value="">Tất cả khóa học</option>
            {myCourses.map((course) => (
              <option key={course.id} value={course.id}>{course.examType} - {course.title}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedClass}
            onChange={(event) => {
              setSelectedClass(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả lớp</option>
            {filteredClasses.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
            ))}
          </select>
        </div>
        <span className="teacher-students__counter">{filteredEnrollments.length} học viên</span>
      </div>

      {/* Bảng danh sách học viên ghép thông tin user, class, course và progress. */}
      <div className="table-wrapper">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Lớp học</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-state"><p>Không có học viên nào</p></td>
                  </tr>
                ) : (
                  paginatedEnrollments.map((enrollment, index) => {
                    return (
                      <tr key={`${enrollment.id}-${index}`}>
                        <td>
                          <div className="teacher-students__identity">
                            <div className="avatar">{(enrollment.userName || "?").charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="teacher-students__name">{enrollment.userName || `ID: ${enrollment.userId}`}</p>
                              <p className="teacher-students__tiny teacher-students__muted">{enrollment.userEmail || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {enrollment.courseName ? (
                            <div className="teacher-students__course">
                              <span className={`badge ${getExamBadgeClass(enrollment.examType)}`}>
                                {enrollment.examType}
                              </span>
                              <span className="teacher-students__course-title">{enrollment.courseName}</span>
                            </div>
                          ) : (
                            <span className="teacher-students__muted">—</span>
                          )}
                        </td>
                        <td className="teacher-students__class-cell">{enrollment.className || "—"}</td>
                        <td>
                          <span className={`badge ${ENROLLMENT_STATUS_BADGES[enrollment.status] || "badge-gray"}`}>
                            {ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openStudentDetail(enrollment)}
                            title="Xem bài đã nộp"
                          >
                            👁️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {filteredEnrollments.length > DEFAULT_TABLE_PAGE_SIZE && (
              <div className="pagination">
                <span className="pagination-info">
                  {((page - 1) * DEFAULT_TABLE_PAGE_SIZE) + 1}–{Math.min(page * DEFAULT_TABLE_PAGE_SIZE, filteredEnrollments.length)} / {filteredEnrollments.length}
                </span>
                <div className="pagination-btns">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={`page-btn ${page === index + 1 ? "active" : ""}`}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>›</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal teacher-students__detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Hồ sơ học tập của học viên</h3>
                <p className="teacher-students__muted teacher-students__tiny">
                  {detailModal.enrollment.userName} • {detailModal.enrollment.className || "Chưa có lớp"}
                </p>
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>

            <div className="modal-body teacher-students__detail-body">
              {detailLoading ? (
                <div className="page-loading"><div className="spinner" /></div>
              ) : (
                <>
                  <section className="teacher-students__detail-section">
                    <div className="teacher-students__detail-head">
                      <h4>Bài tập đã nộp</h4>
                      <span className="badge badge-blue">{detailModal.assignments.length}</span>
                    </div>
                    {detailModal.assignments.length === 0 ? (
                      <p className="teacher-students__muted">Chưa có bài tập nào được nộp trong các lớp bạn phụ trách.</p>
                    ) : (
                      <div className="teacher-students__detail-list">
                        {detailModal.assignments.map((submission) => {
                          const assignment = assignmentMap[Number(submission.assignId)];
                          return (
                            <article key={`assignment-${submission.id}`} className="teacher-students__detail-card">
                              <div>
                                <p className="teacher-students__name">{assignment?.title || `Bài tập #${submission.assignId}`}</p>
                                <p className="teacher-students__tiny teacher-students__muted">
                                  {assignment?.examPart || assignment?.type || "Bài tập"} • {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("vi-VN") : "Chưa có thời gian"}
                                </p>
                              </div>
                              <span className={`badge ${submission.status === "graded" ? "badge-green" : "badge-yellow"}`}>
                                {submission.score ?? "Chờ chấm"}
                              </span>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="teacher-students__detail-section">
                    <div className="teacher-students__detail-head">
                      <h4>Bài kiểm tra đã làm</h4>
                      <span className="badge badge-green">{detailModal.quizzes.length}</span>
                    </div>
                    {detailModal.quizzes.length === 0 ? (
                      <p className="teacher-students__muted">Chưa có bài kiểm tra nào được nộp trong các lớp bạn phụ trách.</p>
                    ) : (
                      <div className="teacher-students__detail-list">
                        {detailModal.quizzes.map((submission) => {
                          const quiz = quizMap[Number(submission.quizId)];
                          const classNames = quiz ? getLinkedClassIds(quiz)
                            .map((classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || `Lớp #${classId}`)
                            .join(", ") : "";
                          return (
                            <article key={`quiz-${submission.id}`} className="teacher-students__detail-card">
                              <div>
                                <p className="teacher-students__name">{quiz?.title || `Quiz #${submission.quizId}`}</p>
                                <p className="teacher-students__tiny teacher-students__muted">
                                  {quiz?.examPart || "Quiz"} • {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString("vi-VN") : "Chưa có thời gian"}
                                </p>
                                {classNames && (
                                  <p className="teacher-students__tiny teacher-students__muted">Lớp: {classNames}</p>
                                )}
                              </div>
                              <span className="badge badge-green">{submission.score ?? 0}/100</span>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <section className="teacher-students__detail-section">
                    <div className="teacher-students__detail-head">
                      <h4>Bài thi thử đã làm</h4>
                      <span className="badge badge-purple">{detailModal.tests.length}</span>
                    </div>
                    {detailModal.tests.length === 0 ? (
                      <p className="teacher-students__muted">Chưa có bài thi thử nào được nộp trong các lớp bạn phụ trách.</p>
                    ) : (
                      <div className="teacher-students__detail-list">
                        {detailModal.tests.map((submission) => {
                          const test = testMap[Number(submission.testId)];
                          const classNames = test ? getLinkedClassIds(test)
                            .map((classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || `Lớp #${classId}`)
                            .join(", ") : "";
                          return (
                            <article key={`test-${submission.id}`} className="teacher-students__detail-card">
                              <div>
                                <p className="teacher-students__name">{test?.title || `Test #${submission.testId}`}</p>
                                <p className="teacher-students__tiny teacher-students__muted">
                                  {test?.examType || "Test"} • Lần {submission.attemptNumber || 1}
                                </p>
                                {classNames && (
                                  <p className="teacher-students__tiny teacher-students__muted">Lớp: {classNames}</p>
                                )}
                              </div>
                              <span className="badge badge-purple">{submission.totalScore ?? 0}/{test?.totalScore || 100}</span>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
