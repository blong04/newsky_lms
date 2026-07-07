import React, { useEffect, useState } from "react";
import { classService } from "../../services/classService";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { userService } from "../../services/userService";
import { CLASS_STATUS_BADGES, CLASS_STATUS_LABELS } from "../../constants/classes";
import { getExamBadgeClass } from "../../constants/courses";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Classes.css";

const INIT_FORM = {
  courseId: "",
  teacherId: "",
  name: "",
  description: "",
  maxStudents: 30,
  startDate: "",
  endDate: "",
  status: "pending",
};

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState(INIT_FORM);

  // Tập trung tải dữ liệu quản trị trong một chỗ để giảm request lặp lại.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classData, courseData, userData, enrollmentData] = await Promise.all([
        classService.getAdminClasses(),
        courseService.getAll(),
        userService.getAll(),
        enrollmentService.getAdminDetails().catch(() => []),
      ]);

      const allUsers = userData || [];
      setClasses(classData || []);
      setCourses(courseData || []);
      setTeachers(
        allUsers.filter((user) => user.roleId === 2)
      );
      setEnrollments(enrollmentData || []);
    } catch {
      toast.error("Không thể tải dữ liệu lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tránh để phân trang trỏ sang trang không còn tồn tại khi thay đổi bộ lọc.
  useEffect(() => {
    const nextTotalPages = Math.max(
      1,
      Math.ceil(filteredClasses.length / DEFAULT_TABLE_PAGE_SIZE)
    );
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [page, search, statusFilter, classes, courses, teachers, enrollments]);

  const getCourse = (courseId) =>
    courses.find((course) => course.id === Number(courseId));

  const getTeacher = (teacherId) =>
    teachers.find((teacher) => teacher.id === Number(teacherId));

  const getClassEnrollments = (classId) =>
    enrollments.filter((enrollment) => Number(enrollment.classId) === Number(classId));

  const getApprovedCount = (classId) =>
    getClassEnrollments(classId).filter((enrollment) =>
      ["approved", "enrolled", "completed"].includes(enrollment.status)
    ).length;

  const filteredClasses = classes.filter((classItem) => {
    const course = getCourse(classItem.courseId);
    const teacher = getTeacher(classItem.teacherId);
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      classItem.name?.toLowerCase().includes(normalizedSearch) ||
      course?.title?.toLowerCase().includes(normalizedSearch) ||
      teacher?.name?.toLowerCase().includes(normalizedSearch);

    return matchesSearch && (!statusFilter || classItem.status === statusFilter);
  });

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedClasses = filteredClasses.slice(
    (page - 1) * DEFAULT_TABLE_PAGE_SIZE,
    page * DEFAULT_TABLE_PAGE_SIZE
  );

  const totalClasses = classes.length;
  const activeClasses = classes.filter((classItem) => classItem.status === "active").length;
  const pendingClasses = classes.filter((classItem) => classItem.status === "pending").length;
  const totalSeats = classes.reduce(
    (sum, classItem) => sum + Number(classItem.maxStudents || 0),
    0
  );
  const approvedStudents = classes.reduce(
    (sum, classItem) => sum + getApprovedCount(classItem.id),
    0
  );
  const occupancyRate =
    totalSeats > 0 ? Math.round((approvedStudents / totalSeats) * 100) : 0;

  const openAddModal = () => {
    setSelected(null);
    setForm(INIT_FORM);
    setModal("add");
  };

  const openEditModal = (classItem) => {
    setSelected(classItem);
    setForm({
      courseId: classItem.courseId || "",
      teacherId: classItem.teacherId || "",
      name: classItem.name || "",
      description: classItem.description || "",
      maxStudents: classItem.maxStudents || 30,
      startDate: classItem.startDate || "",
      endDate: classItem.endDate || "",
      status: classItem.status || "pending",
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.courseId || !form.name.trim()) {
      toast.error("Chọn khóa học và nhập tên lớp");
      return;
    }

    try {
      const payload = {
        ...form,
        courseId: Number(form.courseId),
        teacherId: form.teacherId ? Number(form.teacherId) : null,
        maxStudents: Number(form.maxStudents),
      };

      if (modal === "add") {
        await classService.createAdminClass(payload);
      } else {
        await classService.updateAdminClass(selected.id, payload);
      }

      toast.success("Lưu lớp học thành công");
      setModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu lớp học");
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm("Xóa lớp học này?")) {
      return;
    }

    try {
      await classService.deleteAdminClass(classId);
      toast.success("Đã xóa lớp học");
      fetchData();
    } catch {
      toast.error("Không thể xóa lớp học");
    }
  };

  return (
    <div className="admin-page fade-in classes-page">
      <section className="classes-hero">
        <div className="classes-hero__content">
          <p className="classes-hero__eyebrow">Điều phối đào tạo</p>
          <h1>Quản lý lớp học</h1>
          <p>
            Theo dõi lớp đang vận hành, tải trọng học viên và giáo viên phụ trách
            để sắp lịch hợp lý hơn.
          </p>
        </div>

        <div className="classes-hero__panel">
          <span className="classes-hero__panel-label">Công suất hiện tại</span>
          <strong>{occupancyRate}%</strong>
          <p>
            {approvedStudents}/{totalSeats} chỗ học đã được lấp đầy
          </p>
          <progress
            className="classes-progress"
            value={Math.min(occupancyRate, 100)}
            max="100"
          />
        </div>
      </section>

      <section className="classes-overview-grid">
        <article className="classes-overview-card">
          <span className="classes-overview-card__icon">🏫</span>
          <div>
            <p>Tổng lớp</p>
            <strong>{totalClasses}</strong>
          </div>
        </article>

        <article className="classes-overview-card">
          <span className="classes-overview-card__icon">🟢</span>
          <div>
            <p>Đang học</p>
            <strong>{activeClasses}</strong>
          </div>
        </article>

        <article className="classes-overview-card">
          <span className="classes-overview-card__icon">🕒</span>
          <div>
            <p>Chờ khai giảng</p>
            <strong>{pendingClasses}</strong>
          </div>
        </article>

        <article className="classes-overview-card">
          <span className="classes-overview-card__icon">👥</span>
          <div>
            <p>Học viên duyệt</p>
            <strong>{approvedStudents}</strong>
          </div>
        </article>
      </section>

      <div className="toolbar classes-toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="Tìm lớp, khóa học hoặc giáo viên..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ khai giảng</option>
            <option value="active">Đang học</option>
            <option value="completed">Kết thúc</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          + Tạo lớp mới
        </button>
      </div>

      <div className="table-wrapper classes-table-wrapper">
        {loading ? (
          <div className="page-loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <table className="data-table classes-table">
              <thead>
                <tr>
                  <th>Lớp học</th>
                  <th>Khóa học</th>
                  <th>Giáo viên</th>
                  <th>Sĩ số</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      <p>Không có lớp học phù hợp với bộ lọc hiện tại</p>
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map((classItem) => {
                    const course = getCourse(classItem.courseId);
                    const teacher = getTeacher(classItem.teacherId);
                    const approvedCount = getApprovedCount(classItem.id);

                    return (
                      <tr key={classItem.id}>
                        <td>
                          <div className="classes-name-cell">
                            <p className="classes-name-cell__title">{classItem.name}</p>
                            <p className="classes-name-cell__description">
                              {classItem.description || "Chưa có mô tả lớp học."}
                            </p>
                          </div>
                        </td>
                        <td>
                          {course ? (
                            <div className="classes-course-cell">
                              <span
                                className={`badge ${getExamBadgeClass(course.examType)}`}
                              >
                                {course.examType}
                              </span>
                              <span>{course.title}</span>
                            </div>
                          ) : (
                            <span className="classes-muted-copy">Không xác định</span>
                          )}
                        </td>
                        <td>
                          {teacher ? (
                            <div className="classes-teacher-cell">  
                              <p>{teacher.name}</p>
                            </div>
                          ) : (
                            <span className="classes-muted-copy">Chưa phân công</span>
                          )}
                        </td>
                        <td>
                          <div className="classes-capacity-cell">
                            <span>{approvedCount}/{classItem.maxStudents || 0} chỗ</span>
                          </div>
                        </td>
                        <td>
                          <div className="classes-schedule-cell">
                            <strong>{classItem.startDate || "—"}</strong>
                            <span>{classItem.endDate || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              CLASS_STATUS_BADGES[classItem.status] || "badge-gray"
                            }`}
                          >
                            {CLASS_STATUS_LABELS[classItem.status] || classItem.status}
                          </span>
                        </td>
                        <td>
                          <div className="classes-actions">
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => setDetailModal(classItem)}
                            >
                              Học viên
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => openEditModal(classItem)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(classItem.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  {Math.min((page - 1) * DEFAULT_TABLE_PAGE_SIZE + 1, filteredClasses.length)}–
                  {Math.min(page * DEFAULT_TABLE_PAGE_SIZE, filteredClasses.length)} /{" "}
                  {filteredClasses.length}
                </span>
                <div className="pagination-btns">
                  <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      className={`page-btn ${page === index + 1 ? "active" : ""}`}
                      onClick={() => setPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal classes-form-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="classes-hero__eyebrow">
                  {modal === "add" ? "Tạo mới" : "Cập nhật"}
                </p>
                <h3>{modal === "add" ? "Khởi tạo lớp học" : "Chỉnh sửa lớp học"}</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Khóa học *</label>
                <select
                  value={form.courseId}
                  onChange={(event) =>
                    setForm({ ...form, courseId: event.target.value })
                  }
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.examType} · {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Giáo viên phụ trách</label>
                <select
                  value={form.teacherId}
                  onChange={(event) =>
                    setForm({ ...form, teacherId: event.target.value })
                  }
                >
                  <option value="">Chưa phân công</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tên lớp *</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Ví dụ: IELTS_ADV_A_2026"
                />
              </div>

              <div className="form-group">
                <label>Mô tả lớp</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Mô tả khung giờ, mục tiêu hoặc ghi chú triển khai."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sĩ số tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxStudents}
                    onChange={(event) =>
                      setForm({ ...form, maxStudents: event.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option value="pending">Chờ khai giảng</option>
                    <option value="active">Đang học</option>
                    <option value="completed">Kết thúc</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({ ...form, startDate: event.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) =>
                      setForm({ ...form, endDate: event.target.value })
                    }
                  />
                </div>
              </div>

              <div className="classes-form-note">
                <strong>Gợi ý:</strong> khi tạo lớp mới, bạn nên gán giáo viên ngay
                từ đầu để bảng điều phối phản ánh đúng tải giảng dạy.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal === "add" ? "Tạo lớp học" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal classes-detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header classes-detail-modal__header">
              <div>
                <p className="classes-hero__eyebrow">
                  {getCourse(detailModal.courseId)?.examType || "OTHER"} ·{" "}
                  {CLASS_STATUS_LABELS[detailModal.status] || detailModal.status}
                </p>
                <h3>{detailModal.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="classes-detail-grid">
                <div className="classes-detail-card">
                  <span>Khóa học</span>
                  <strong>{getCourse(detailModal.courseId)?.title || "Không xác định"}</strong>
                </div>
                <div className="classes-detail-card">
                  <span>Giáo viên</span>
                  <strong>{getTeacher(detailModal.teacherId)?.name || "Chưa phân công"}</strong>
                </div>
                <div className="classes-detail-card">
                  <span>Sĩ số duyệt</span>
                  <strong>
                    {getApprovedCount(detailModal.id)}/{detailModal.maxStudents || 0}
                  </strong>
                </div>
                <div className="classes-detail-card">
                  <span>Lịch học</span>
                  <strong>
                    {detailModal.startDate || "—"} → {detailModal.endDate || "—"}
                  </strong>
                </div>
              </div>

              <section className="classes-detail-section">
                <div className="classes-detail-section__header">
                  <div>
                    <h4>Danh sách học viên</h4>
                    <p>{getClassEnrollments(detailModal.id).length} bản ghi đăng ký</p>
                  </div>
                </div>

                {getClassEnrollments(detailModal.id).length === 0 ? (
                  <div className="classes-empty-block">
                    Chưa có học viên đăng ký vào lớp này.
                  </div>
                ) : (
                  <div className="classes-student-list">
                    {getClassEnrollments(detailModal.id).map((enrollment) => (
                      <article key={enrollment.id} className="classes-student-card">
                        <div className="classes-student-card__identity">
                          <span className="classes-student-avatar">
                            {enrollment.userName?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                          <div>
                            <h5>{enrollment.userName || `Học viên #${enrollment.userId}`}</h5>
                            <p>{enrollment.userEmail || "Chưa có email"}</p>
                          </div>
                        </div>

                        <div className="classes-student-card__meta">
                          <span
                            className={`badge ${
                              CLASS_STATUS_BADGES[enrollment.status] || "badge-gray"
                            }`}
                          >
                            {CLASS_STATUS_LABELS[enrollment.status] || enrollment.status}
                          </span>
                          <strong>{Number(enrollment.progress || 0)}%</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
