import React, { useEffect, useMemo, useState } from "react";
import { classService } from "../../services/classService";
import { CLASS_STATUS_BADGES, CLASS_STATUS_LABELS } from "../../constants/classes";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Classes.css";

export default function TeacherClasses() {
  // State nguồn dữ liệu cần để ghép bảng lớp với danh sách học viên đã enrich.
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loading, setLoading] = useState(true);

  // State điều khiển UI tìm kiếm, phân trang và panel chi tiết.
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      try {
        const myClasses = await classService.getTeacherClasses();
        setClasses(myClasses);

        const studentResponses = await Promise.all(
          myClasses.map((classroom) =>
            classService.getTeacherClassStudents(classroom.id)
              .then((response) => [classroom.id, response || []])
              .catch(() => [])
          )
        );

        setStudentsByClass(Object.fromEntries(studentResponses.filter((entry) => entry.length === 2)));
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu lớp học");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const getApprovedEnrollments = (classId) => (
    studentsByClass[classId] || []
  );

  // Bảng lớp đã qua tìm kiếm theo tên lớp hoặc tên khóa học.
  const filteredClasses = useMemo(() => (
    classes.filter((classroom) => {
      return !search
        || classroom.name?.toLowerCase().includes(search.toLowerCase())
        || classroom.courseName?.toLowerCase().includes(search.toLowerCase());
    })
  ), [classes, search]);

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedClasses = filteredClasses.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);
  const selectedStudents = selected ? getApprovedEnrollments(selected.id) : [];

  return (
    <div className="admin-page fade-in teacher-classes">
      <section className="teacher-classes__hero">
        <div>
          <p className="teacher-classes__eyebrow">Class workspace</p>
          <h1>Lớp của tôi</h1>
          <p className="teacher-classes__subtitle">
            Theo dõi sĩ số, khóa học gắn với từng lớp và mở nhanh danh sách học viên ngay trong cùng màn hình.
          </p>
        </div>
        <div className="teacher-classes__hero-card">
          <span>Tổng lớp phụ trách</span>
          <strong>{classes.length}</strong>
          <p>{filteredClasses.length} lớp đang hiển thị theo bộ lọc hiện tại.</p>
        </div>
      </section>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="🔍 Tìm lớp hoặc khóa học"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <span className="teacher-classes__counter">{filteredClasses.length} lớp</span>
      </div>

      {/* Bảng lớp chính; danh sách học viên sẽ mở bằng modal để giáo viên xem tập trung hơn. */}
      <div className="teacher-classes__layout">
        <div className="table-wrapper">
          {loading ? (
            <div className="page-loading"><div className="spinner" /></div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên lớp</th>
                    <th>Khóa học</th>
                    <th>Sĩ số</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClasses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state"><p>Chưa có lớp nào được phân công cho bạn</p></td>
                    </tr>
                  ) : (
                    paginatedClasses.map((classroom) => {
                      const approvedStudents = getApprovedEnrollments(classroom.id);

                      return (
                        <tr
                          key={classroom.id}
                          className={selected?.id === classroom.id ? "teacher-classes__row--active" : ""}
                        >
                          <td className="teacher-classes__name">{classroom.name}</td>
                          <td>
                            {classroom.courseName ? (
                              <div className="teacher-classes__course">
                                <span className={`badge ${classroom.examType === "IELTS" ? "badge-blue" : classroom.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                                  {classroom.examType}
                                </span>
                                <span className="teacher-classes__course-title">{classroom.courseName}</span>
                              </div>
                            ) : (
                              <span className="teacher-classes__muted">—</span>
                            )}
                          </td>
                          <td>
                            <span className="teacher-classes__name">{approvedStudents.length}</span>
                            <span className="teacher-classes__capacity">/{classroom.maxStudents}</span>
                          </td>
                          <td className="teacher-classes__muted teacher-classes__tiny">
                            {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString("vi-VN") : "—"}
                            {" → "}
                            {classroom.endDate ? new Date(classroom.endDate).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td>
                            <span className={`badge ${CLASS_STATUS_BADGES[classroom.status] || "badge-gray"}`}>
                              {CLASS_STATUS_LABELS[classroom.status] || classroom.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              title="Xem học viên"
                              onClick={() => setSelected(selected?.id === classroom.id ? null : classroom)}
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

              {filteredClasses.length > DEFAULT_TABLE_PAGE_SIZE && (
                <div className="pagination">
                  <span className="pagination-info">
                    {((page - 1) * DEFAULT_TABLE_PAGE_SIZE) + 1}–{Math.min(page * DEFAULT_TABLE_PAGE_SIZE, filteredClasses.length)} / {filteredClasses.length}
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

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal teacher-classes__student-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selected.name}</h3>
                <p className="teacher-classes__tiny teacher-classes__muted">{selectedStudents.length} học viên đã duyệt</p>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Học viên</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="empty-state"><p>Chưa có học viên</p></td>
                    </tr>
                  ) : (
                    selectedStudents.map((enrollment) => (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="teacher-classes__student">
                            <div className="avatar teacher-classes__student-avatar">
                              {(enrollment.userName || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="teacher-classes__student-name">{enrollment.userName || `ID: ${enrollment.userId}`}</p>
                              <p className="teacher-classes__tiny teacher-classes__muted">{enrollment.userEmail || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${enrollment.status === "approved" ? "badge-green" : enrollment.status === "completed" ? "badge-gray" : "badge-blue"}`}>
                            {enrollment.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
