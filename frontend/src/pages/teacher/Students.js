import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "../admin/Admin.css";
import "./Teacher.css";
import "./Students.css";

const PAGE_SIZE = 10;

const STATUS_LABEL = {
  approved: "Đã duyệt",
  enrolled: "Đang học",
  completed: "Hoàn thành",
};

const STATUS_BADGE = {
  approved: "badge-blue",
  enrolled: "badge-green",
  completed: "badge-gray",
};

export default function TeacherStudents() {
  // State dữ liệu cho bộ lọc học viên theo khóa và lớp.
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển giao diện và phân trang.
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const classResponse = await api.get("/teacher/classes");
        const myClasses = classResponse.data.data || [];
        setClasses(myClasses);

        const enrollmentResponses = await Promise.all(
          myClasses.map((classroom) =>
            api.get(`/teacher/classes/${classroom.id}/students`)
              .then((response) => response.data.data || [])
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

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / PAGE_SIZE));
  const paginatedEnrollments = filteredEnrollments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                  <th>Lớp học</th>
                  <th>Khóa học</th>
                  <th>Trạng thái</th>
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
                        <td className="teacher-students__class-cell">{enrollment.className || "—"}</td>
                        <td>
                          {enrollment.courseName ? (
                            <div className="teacher-students__course">
                              <span className={`badge ${enrollment.examType === "IELTS" ? "badge-blue" : enrollment.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                                {enrollment.examType}
                              </span>
                              <span className="teacher-students__course-title">{enrollment.courseName}</span>
                            </div>
                          ) : (
                            <span className="teacher-students__muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[enrollment.status] || "badge-gray"}`}>
                            {STATUS_LABEL[enrollment.status] || enrollment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {filteredEnrollments.length > PAGE_SIZE && (
              <div className="pagination">
                <span className="pagination-info">
                  {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredEnrollments.length)} / {filteredEnrollments.length}
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
    </div>
  );
}
