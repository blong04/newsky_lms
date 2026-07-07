import React, { useEffect, useState } from "react";
import { courseService } from "../../services/courseService";
import { userService } from "../../services/userService";
import { CLASS_STATUS_BADGES, CLASS_STATUS_LABELS } from "../../constants/classes";
import { COURSE_STATUS_LABELS, LEVEL_LABELS, getExamBadgeClass } from "../../constants/courses";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import { formatCoursePrice } from "../../utils/format";
import toast from "react-hot-toast";
import "./Courses.css";
const INIT_FORM = {
  title: "",
  description: "",
  price: 0,
  level: "beginner",
  examType: "OTHER",
  status: "active",
};

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [courseClasses, setCourseClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);

  // Tải danh sách khóa học và giáo viên để dùng cho bảng tổng quan lẫn modal chi tiết.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseData, userData] = await Promise.all([
        courseService.getAll(),
        userService.getAll(),
      ]);

      setCourses(courseData || []);
      setTeachers(
        (userData || []).filter(
          (user) => user.roleId === 2
        )
      );
    } catch {
      toast.error("Không thể tải dữ liệu khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Giữ trang hiện tại hợp lệ khi bộ lọc làm thay đổi số lượng kết quả.
  useEffect(() => {
    const nextTotalPages = Math.max(
      1,
      Math.ceil(filteredCourses.length / DEFAULT_TABLE_PAGE_SIZE)
    );
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [page, search, examFilter, statusFilter, courses]);

  const filteredCourses = courses.filter((course) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      course.title?.toLowerCase().includes(normalizedSearch) ||
      course.description?.toLowerCase().includes(normalizedSearch);

    return (
      matchesSearch &&
      (!examFilter || course.examType === examFilter) &&
      (!statusFilter || course.status === statusFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * DEFAULT_TABLE_PAGE_SIZE,
    page * DEFAULT_TABLE_PAGE_SIZE
  );

  const totalCourses = courses.length;
  const activeCourses = courses.filter((course) => course.status === "active").length;
  const examCourses = courses.filter((course) => course.examType !== "OTHER").length;
  const freeCourses = courses.filter((course) => Number(course.price || 0) === 0).length;

  const getExamThemeClass = (examType) => {
    if (examType === "IELTS") return "courses-theme-ielts";
    if (examType === "TOEIC") return "courses-theme-toeic";
    return "courses-theme-other";
  };

  const getTeacherName = (teacherId) =>
    teachers.find((teacher) => teacher.id === Number(teacherId))?.name ||
    "Chưa phân công";

  const openView = async (course) => {
    setViewModal(course);
    setClassesLoading(true);

    try {
      const response = await courseService.getClasses(course.id);
      setCourseClasses(response || []);
    } catch {
      setCourseClasses([]);
      toast.error("Không thể tải danh sách lớp của khóa học");
    } finally {
      setClassesLoading(false);
    }
  };

  const openAddModal = () => {
    setSelected(null);
    setForm(INIT_FORM);
    setModal("add");
  };

  const openEditModal = (course) => {
    setSelected(course);
    setForm({
      title: course.title || "",
      description: course.description || "",
      price: course.price || 0,
      level: course.level || "beginner",
      examType: course.examType || "OTHER",
      status: course.status || "active",
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Nhập tên khóa học");
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
      };

      if (modal === "add") {
        await courseService.create(payload);
        toast.success("Tạo khóa học thành công");
      } else {
        await courseService.update(selected.id, payload);
        toast.success("Cập nhật khóa học thành công");
      }

      setModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu khóa học");
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Xóa khóa học này?")) {
      return;
    }

    try {
      await courseService.delete(courseId);
      toast.success("Đã xóa khóa học");
      fetchData();
    } catch {
      toast.error("Không thể xóa vì khóa học đang liên kết dữ liệu khác");
    }
  };

  const filteredSummaryLabel =
    filteredCourses.length === totalCourses
      ? "Đang hiển thị toàn bộ danh mục đào tạo"
      : `Đang hiển thị ${filteredCourses.length}/${totalCourses} khóa học theo bộ lọc`;

  return (
    <div className="admin-page fade-in courses-page">
      <section className="courses-hero">
        <div className="courses-hero__content">
          <p className="courses-hero__eyebrow">Danh mục đào tạo</p>
          <h1>Quản lý khóa học</h1>
          <p>
            Theo dõi cấu trúc khóa học, trạng thái mở bán và tiến độ triển khai
            lớp học trên cùng một màn hình rõ ràng hơn.
          </p>
        </div>

        <div className="courses-hero__panel">
          <span className="courses-hero__panel-label">Tổng quan nhanh</span>
          <strong>{filteredCourses.length}</strong>
          <p>{filteredSummaryLabel}</p>
          <div className="courses-hero__chips">
            <span className="courses-chip">IELTS {courses.filter((item) => item.examType === "IELTS").length}</span>
            <span className="courses-chip">TOEIC {courses.filter((item) => item.examType === "TOEIC").length}</span>
            <span className="courses-chip">Miễn phí {freeCourses}</span>
          </div>
        </div>
      </section>

      <section className="courses-overview-grid">
        <article className="courses-overview-card">
          <span className="courses-overview-card__icon">📚</span>
          <div>
            <p>Tổng khóa học</p>
            <strong>{totalCourses}</strong>
          </div>
        </article>

        <article className="courses-overview-card">
          <span className="courses-overview-card__icon">🚀</span>
          <div>
            <p>Đang mở</p>
            <strong>{activeCourses}</strong>
          </div>
        </article>

        <article className="courses-overview-card">
          <span className="courses-overview-card__icon">🎯</span>
          <div>
            <p>Khóa luyện thi</p>
            <strong>{examCourses}</strong>
          </div>
        </article>

        <article className="courses-overview-card">
          <span className="courses-overview-card__icon">🎁</span>
          <div>
            <p>Miễn phí</p>
            <strong>{freeCourses}</strong>
          </div>
        </article>
      </section>

      <div className="toolbar courses-toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="Tìm theo tên hoặc mô tả khóa học..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <select
            className="filter-select"
            value={examFilter}
            onChange={(event) => {
              setExamFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả nhóm đào tạo</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEIC">TOEIC</option>
            <option value="OTHER">Tiếng Anh tổng quát</option>
          </select>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang mở</option>
            <option value="inactive">Tạm ẩn</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={openAddModal}>
          + Tạo khóa học
        </button>
      </div>

      <div className="table-wrapper courses-table-wrapper">
        {loading ? (
          <div className="page-loading">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <table className="data-table courses-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Loại</th>
                  <th>Cấp độ</th>
                  <th>Học phí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      <p>Không có khóa học phù hợp với bộ lọc hiện tại</p>
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <div className="courses-course-cell">
                          <div className={`courses-course-mark ${getExamThemeClass(course.examType)}`} />
                          <div className="courses-course-copy">
                            <p className="courses-course-title">{course.title}</p>
                            <p className="courses-course-description">
                              {course.description || "Chưa có mô tả cho khóa học này."}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getExamBadgeClass(course.examType)}`}>
                          {course.examType}
                        </span>
                      </td>
                      <td>
                        <span className="courses-level-pill">
                          {LEVEL_LABELS[course.level] || course.level}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`courses-price ${
                            Number(course.price || 0) > 0
                              ? "courses-price--paid"
                              : "courses-price--free"
                          }`}
                        >
                          {formatCoursePrice(course.price)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            course.status === "active" ? "badge-green" : "badge-red"
                          }`}
                        >
                          {COURSE_STATUS_LABELS[course.status] || course.status}
                        </span>
                      </td>
                      <td>
                        <div className="courses-actions">
                          <button
                            className="btn btn-info btn-sm"
                            title="Xem chi tiết"
                            onClick={() => openView(course)}
                          >
                            Xem
                          </button>
                          <button
                            className="btn btn-warning btn-sm"
                            title="Chỉnh sửa"
                            onClick={() => openEditModal(course)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Xóa khóa học"
                            onClick={() => handleDelete(course.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <span className="pagination-info">
                  {Math.min((page - 1) * DEFAULT_TABLE_PAGE_SIZE + 1, filteredCourses.length)}–
                  {Math.min(page * DEFAULT_TABLE_PAGE_SIZE, filteredCourses.length)} /{" "}
                  {filteredCourses.length}
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

      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal courses-modal" onClick={(event) => event.stopPropagation()}>
            <div
              className={`modal-header courses-modal-header ${getExamThemeClass(
                viewModal.examType
              )}`}
            >
              <div>
                <p className="courses-modal-header__eyebrow">
                  {viewModal.examType} · {LEVEL_LABELS[viewModal.level]}
                </p>
                <h3>{viewModal.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setViewModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="courses-detail-grid">
                <div className="courses-detail-card">
                  <span>Học phí</span>
                  <strong>{formatCoursePrice(viewModal.price)}</strong>
                </div>
                <div className="courses-detail-card">
                  <span>Trạng thái</span>
                  <strong>{COURSE_STATUS_LABELS[viewModal.status] || viewModal.status}</strong>
                </div>
              </div>

              <section className="courses-detail-section">
                <h4>Mô tả khóa học</h4>
                <p>
                  {viewModal.description || "Khóa học này chưa có mô tả chi tiết."}
                </p>
              </section>

              <section className="courses-detail-section">
                <div className="courses-detail-section__header">
                  <div>
                    <h4>Lớp học đang gắn với khóa này</h4>
                    <p>{courseClasses.length} lớp học đã được tạo</p>
                  </div>
                </div>

                {classesLoading ? (
                  <div className="courses-loading-block">
                    <div className="spinner" />
                  </div>
                ) : courseClasses.length === 0 ? (
                  <div className="courses-empty-block">
                    Chưa có lớp học nào thuộc khóa học này.
                  </div>
                ) : (
                  <div className="courses-class-list">
                    {courseClasses.map((classItem) => (
                      <article key={classItem.id} className="courses-class-card">
                        <div className="courses-class-card__top">
                          <div>
                            <h5>{classItem.name}</h5>
                            <p>{getTeacherName(classItem.teacherId)}</p>
                          </div>
                          <span
                            className={`badge ${
                              CLASS_STATUS_BADGES[classItem.status] || "badge-gray"
                            }`}
                          >
                            {CLASS_STATUS_LABELS[classItem.status] || classItem.status}
                          </span>
                        </div>

                        <div className="courses-class-card__meta">
                          <div>
                            <span>Sĩ số</span>
                            <strong>
                              {classItem.currentStudents || 0}/{classItem.maxStudents || 0}
                            </strong>
                          </div>
                          <div>
                            <span>Thời gian</span>
                            <strong>
                              {classItem.startDate || "—"} → {classItem.endDate || "—"}
                            </strong>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setViewModal(null)}>
                Đóng
              </button>
              <button
                className="btn btn-warning"
                onClick={() => {
                  openEditModal(viewModal);
                  setViewModal(null);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal courses-form-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="courses-modal-header__eyebrow">
                  {modal === "add" ? "Tạo mới" : "Cập nhật"}
                </p>
                <h3>{modal === "add" ? "Khởi tạo khóa học" : "Chỉnh sửa khóa học"}</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Tên khóa học *</label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Ví dụ: IELTS Foundation 2026"
                />
              </div>

              <div className="form-group">
                <label>Mô tả tổng quan</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Tóm tắt mục tiêu, đối tượng và kết quả đầu ra của khóa học."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nhóm đào tạo</label>
                  <select
                    value={form.examType}
                    onChange={(event) =>
                      setForm({ ...form, examType: event.target.value })
                    }
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="TOEIC">TOEIC</option>
                    <option value="OTHER">Tiếng Anh tổng quát</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cấp độ</label>
                  <select
                    value={form.level}
                    onChange={(event) =>
                      setForm({ ...form, level: event.target.value })
                    }
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Học phí (VNĐ)</label>
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
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
                    <option value="active">Đang mở</option>
                    <option value="inactive">Tạm ẩn</option>
                  </select>
                </div>
              </div>

              <div className="courses-form-note">
                <strong>Gợi ý:</strong> mô tả rõ kết quả đầu ra và nhóm học viên mục
                tiêu sẽ giúp admin quản lý danh mục khóa học trực quan hơn.
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal === "add" ? "Tạo khóa học" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
