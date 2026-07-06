import React, { useEffect, useMemo, useState } from "react";
import { classService } from "../../services/classService";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { CLASS_STATUS_BADGES, CLASS_STATUS_LABELS } from "../../constants/classes";
import { LEVEL_LABELS } from "../../constants/courses";
import { ENROLLMENT_STATUS_META } from "../../constants/enrollments";
import { STUDENT_COURSE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Courses.css";

export default function StudentCourses() {
  // State dữ liệu khóa học, lớp và đăng ký hiện có.
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State bộ lọc và phân trang danh sách khóa học.
  const [search, setSearch] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [enrollFilter, setEnrollFilter] = useState("");
  const [page, setPage] = useState(1);

  // State modal chi tiết và luồng đăng ký.
  const [detailModal, setDetailModal] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPaymentView, setShowPaymentView] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Load toàn bộ dữ liệu cần cho màn catalog khóa học.
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [courseData, enrollmentData, classData] = await Promise.all([
          courseService.getAll(),
          enrollmentService.getStudentEnrollments(),
          classService.getPublicClasses(),
        ]);

        setCourses((courseData || []).filter((course) => course.status === "active"));
        setEnrollments(enrollmentData || []);
        setClasses(classData || []);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Chỉ xem enrollment còn hiệu lực là đã đăng ký; trạng thái dropped/rejected được xem như có thể đăng ký lại.
  const getEnrollment = (courseId) => enrollments.find((item) =>
    (item.courseId === courseId || item.courseId === Number(courseId))
    && !["dropped", "rejected"].includes(item.status)
  );

  const getAvailableClasses = (courseId) => (
    classes.filter((item) =>
      Number(item.courseId) === Number(courseId)
      && item.status === "pending"
      && (item.currentStudents || 0) < (item.maxStudents || 999))
  );

  const getCourseClasses = (courseId) => classes.filter((item) => Number(item.courseId) === Number(courseId));

  const filteredCourses = useMemo(() => (
    courses.filter((course) => {
        const enrollment = getEnrollment(course.id);
      const matchSearch = !search || course.title?.toLowerCase().includes(search.toLowerCase()) || course.description?.toLowerCase().includes(search.toLowerCase());
      const matchExam = !examFilter || course.examType === examFilter;
      const matchLevel = !levelFilter || course.level === levelFilter;
      const matchEnroll = !enrollFilter
        || (enrollFilter === "enrolled" && enrollment)
        || (enrollFilter === "not_enrolled" && !enrollment);
      return matchSearch && matchExam && matchLevel && matchEnroll;
    })
  ), [courses, search, examFilter, levelFilter, enrollFilter, enrollments]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / STUDENT_COURSE_PAGE_SIZE));
  const paginatedCourses = filteredCourses.slice((page - 1) * STUDENT_COURSE_PAGE_SIZE, page * STUDENT_COURSE_PAGE_SIZE);

  const refreshEnrollments = async () => {
    const response = await enrollmentService.getStudentEnrollments();
    setEnrollments(response || []);
  };

  const handleEnrollClick = (course) => {
    const enrollment = getEnrollment(course.id);
    if (enrollment) {
      toast("Bạn đã đăng ký khóa học này rồi");
      return;
    }

    setEnrollModal(course);
    setSelectedClass(null);
    setShowPaymentView(false);
  };

  const handleCancelEnroll = async (enrollment) => {
    if (enrollment.status !== "pending") {
      toast.error("Chỉ có thể hủy đăng ký khi chưa được phê duyệt");
      return;
    }
    if (!window.confirm("Hủy đăng ký khóa học này?")) {
      return;
    }
    try {
      await enrollmentService.cancel(enrollment.id);
      toast.success("Đã hủy đăng ký");
      await refreshEnrollments();
    } catch {
      toast.error("Không thể hủy");
    }
  };

  const submitEnrollment = async (paid) => {
    if (!selectedClass) {
      toast.error("Chọn lớp học");
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentService.createStudentEnrollment({
        courseId: enrollModal.id,
        classId: selectedClass.id,
        paid,
      });
      toast.success(
        paid
          ? "Đã ghi nhận đăng ký và đánh dấu thanh toán."
          : "Đã gửi yêu cầu đăng ký. Vui lòng chờ admin phê duyệt."
      );
      setEnrollModal(null);
      setSelectedClass(null);
      setShowPaymentView(false);
      await refreshEnrollments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thất bại");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-courses">
      {/* Thanh công cụ sticky để lọc catalog khóa học. */}
      <div className="courses-sticky-bar student-courses__sticky-bar">
        <div className="courses-sticky-inner student-courses__sticky-inner">
          <h2 className="student-courses__heading">
            Khóa học <span className="student-courses__heading-count">({filteredCourses.length})</span>
          </h2>
          <div className="student-courses__filters">
            <input
              className="search-input student-courses__search"
              placeholder="🔍 Tìm kiếm khóa học..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <select className="filter-select" value={examFilter} onChange={(event) => { setExamFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả loại</option>
              <option value="IELTS">IELTS</option>
              <option value="TOEIC">TOEIC</option>
              <option value="OTHER">Tiếng Anh chung</option>
            </select>
            <select className="filter-select" value={levelFilter} onChange={(event) => { setLevelFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả cấp độ</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
            <select className="filter-select" value={enrollFilter} onChange={(event) => { setEnrollFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="enrolled">Đã đăng ký</option>
              <option value="not_enrolled">Chưa đăng ký</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bảng catalog khóa học với trạng thái đăng ký. */}
      <div className="table-wrapper student-courses__table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên khóa học</th>
              <th>Ghi chú</th>
              <th>Số lớp</th>
              <th>Học phí</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-state"><p>Không tìm thấy khóa học nào</p></td>
              </tr>
            ) : (
              paginatedCourses.map((course) => {
                const enrollment = getEnrollment(course.id);
                const availableClasses = getAvailableClasses(course.id);
                const allClasses = getCourseClasses(course.id);

                return (
                  <tr key={course.id}>
                    <td><p className="student-courses__course-title">{course.title}</p></td>
                    <td className="student-courses__course-note">
                      {course.description?.slice(0, 60)}{course.description?.length > 60 ? "..." : ""}
                    </td>
                    <td>
                      <span className="student-courses__count-main">{allClasses.length}</span>
                      <span className="student-courses__count-sub">({availableClasses.length} đang tuyển)</span>
                    </td>
                    <td className={`student-courses__price ${course.price > 0 ? "student-courses__price--paid" : "student-courses__price--free"}`}>
                      {course.price > 0 ? `${Number(course.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                    </td>
                    <td>
                      {enrollment
                        ? <span className={`badge ${ENROLLMENT_STATUS_META[enrollment.status]?.badge}`}>{ENROLLMENT_STATUS_META[enrollment.status]?.label}</span>
                        : <span className="badge badge-gray">Chưa đăng ký</span>}
                    </td>
                    <td>
                      <div className="student-courses__actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailModal(course)}>Chi tiết</button>
                        {enrollment?.status === "pending" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelEnroll(enrollment)}>Hủy</button>
                        )}
                        {!enrollment && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEnrollClick(course)}>
                            Đăng ký
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination student-courses__pagination">
          <span className="pagination-info">Trang {page}/{totalPages} — {filteredCourses.length} khóa học</span>
          <div className="pagination-btns">
            <button className="page-btn" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
              const pageNumber = page <= 3 ? index + 1 : page - 2 + index;
              if (pageNumber < 1 || pageNumber > totalPages) {
                return null;
              }
              return (
                <button key={pageNumber} className={`page-btn ${page === pageNumber ? "active" : ""}`} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </button>
              );
            })}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>›</button>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết khóa học và các lớp liên quan. */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal student-courses__detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className={`modal-header student-courses__detail-header student-courses__detail-header--${(detailModal.examType || "OTHER").toLowerCase()}`}>
              <div>
                <span className="student-courses__detail-eyebrow">{detailModal.examType} · {LEVEL_LABELS[detailModal.level]}</span>
                <h3 className="student-courses__detail-title">{detailModal.title}</h3>
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="student-courses__detail-description">{detailModal.description}</p>

              <div className="student-courses__detail-grid">
                <div className="student-courses__detail-card">
                  <p className="student-courses__detail-label">Học phí</p>
                  <p className="student-courses__detail-value student-courses__detail-value--price">
                    {detailModal.price > 0 ? `${Number(detailModal.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                  </p>
                </div>
                <div className="student-courses__detail-card">
                  <p className="student-courses__detail-label">Cấp độ</p>
                  <p className="student-courses__detail-value">{LEVEL_LABELS[detailModal.level]}</p>
                </div>
              </div>

              <h4 className="student-courses__detail-section-title">🏫 Các lớp học</h4>
              {getCourseClasses(detailModal.id).length === 0 ? (
                <p className="student-courses__empty-inline">Chưa có lớp nào</p>
              ) : (
                getCourseClasses(detailModal.id).map((classroom) => {
                  const myEnrollment = enrollments.find((item) => item.classId === classroom.id);
                  return (
                    <div key={classroom.id} className="class-detail-item">
                      <div>
                        <p className="student-courses__class-name">{classroom.name}</p>
                        <p className="student-courses__class-meta">
                          📅 {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString("vi-VN") : "—"} → {classroom.endDate ? new Date(classroom.endDate).toLocaleDateString("vi-VN") : "—"}
                        </p>
                        <p className="student-courses__class-meta">👥 {classroom.currentStudents || 0}/{classroom.maxStudents} học viên</p>
                      </div>
                      <div className="student-courses__class-side">
                        <span className={`badge ${CLASS_STATUS_BADGES[classroom.status]}`}>{CLASS_STATUS_LABELS[classroom.status]}</span>
                        {myEnrollment && myEnrollment.classId === classroom.id && (
                          <p className="student-courses__class-enroll-status">
                            <span className={`badge ${ENROLLMENT_STATUS_META[myEnrollment.status]?.badge}`}>{ENROLLMENT_STATUS_META[myEnrollment.status]?.label}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {getEnrollment(detailModal.id) && (
                <div className="student-courses__payment-box">
                  <p className="student-courses__payment-title">💳 Trạng thái thanh toán</p>
                  <p className="student-courses__payment-note">
                    {getEnrollment(detailModal.id)?.paid ? "✅ Đã thanh toán" : "⏳ Chưa thanh toán — Đang chờ admin phê duyệt"}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Đóng</button>
              {!getEnrollment(detailModal.id) && (
                <button className="btn btn-primary" onClick={() => { setDetailModal(null); handleEnrollClick(detailModal); }}>Đăng ký ngay</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal đăng ký: chọn lớp phù hợp trước khi gửi yêu cầu. */}
      {enrollModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setEnrollModal(null);
            setSelectedClass(null);
            setShowPaymentView(false);
          }}
        >
          <div className="modal student-courses__select-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{showPaymentView ? "Xác nhận đăng ký" : `Đăng ký khóa học — ${enrollModal.title}`}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEnrollModal(null);
                  setSelectedClass(null);
                  setShowPaymentView(false);
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {!showPaymentView ? (
                <>
                  <p className="student-courses__modal-note">Chọn lớp học phù hợp với lịch của bạn:</p>
                  {getAvailableClasses(enrollModal.id).length === 0 ? (
                    <div className="student-courses__empty-inline student-courses__empty-inline--center">
                      Không có lớp đang tuyển
                    </div>
                  ) : (
                    getAvailableClasses(enrollModal.id).map((classroom) => {
                      const isSelected = selectedClass?.id === classroom.id;
                      return (
                        <div
                          key={classroom.id}
                          className={`class-select-item ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedClass(isSelected ? null : classroom)}
                        >
                          <div className="student-courses__select-head">
                            <div>
                              <p className="student-courses__class-name">{classroom.name}</p>
                              <p className="student-courses__class-meta">
                                📅 {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString("vi-VN") : "—"} → {classroom.endDate ? new Date(classroom.endDate).toLocaleDateString("vi-VN") : "—"}
                              </p>
                              <p className="student-courses__class-meta">
                                👥 {classroom.currentStudents || 0}/{classroom.maxStudents} học viên · Còn {Math.max((classroom.maxStudents || 0) - (classroom.currentStudents || 0), 0)} chỗ
                              </p>
                            </div>
                            <div className={`radio-circle ${isSelected ? "checked" : ""}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <p className="student-courses__modal-note">
                    Bạn đang đăng ký lớp <strong>{selectedClass?.name}</strong>. Chọn một phương án bên dưới để hoàn tất yêu cầu.
                  </p>
                  <div className="student-courses__payment-summary">
                    <p className="student-courses__detail-label">Khóa học</p>
                    <p className="student-courses__detail-value">{enrollModal.title}</p>
                    <p className="student-courses__detail-label student-courses__detail-label--spaced">Lớp đã chọn</p>
                    <p className="student-courses__detail-value">{selectedClass?.name || "—"}</p>
                    <div className="student-courses__payment-total">
                      <span>Tổng học phí</span>
                      <span className="student-courses__payment-price">
                        {enrollModal.price > 0 ? `${Number(enrollModal.price).toLocaleString("vi-VN")}đ` : "Miễn phí"}
                      </span>
                    </div>
                  </div>
                  <div className="student-courses__payment-methods">
                    <div className="student-courses__payment-method">
                      <span className="student-courses__payment-icon">🏦</span>
                      <div>
                        <p className="student-courses__payment-method-name">Chuyển khoản / đóng tại trung tâm</p>
                        <p className="student-courses__payment-method-desc">View này chỉ để mô phỏng bước thanh toán, chưa xử lý giao dịch thật.</p>
                      </div>
                    </div>
                  </div>
                  <div className="student-courses__payment-warning">
                    Nếu bạn bỏ qua thanh toán, hệ thống vẫn gửi yêu cầu đăng ký để admin phê duyệt thủ công.
                  </div>
                </>
              )}
            </div>
            <div className={`modal-footer ${showPaymentView ? "student-courses__payment-footer" : ""}`}>
              {!showPaymentView ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setEnrollModal(null);
                      setSelectedClass(null);
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedClass}
                    onClick={() => setShowPaymentView(true)}
                  >
                    Tiếp tục
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-ghost student-courses__payment-btn"
                    onClick={() => setShowPaymentView(false)}
                    disabled={enrolling}
                  >
                    ← Chọn lại lớp
                  </button>
                  <button
                    className="btn btn-warning student-courses__payment-btn"
                    onClick={() => submitEnrollment(false)}
                    disabled={enrolling}
                  >
                    {enrolling ? <span className="spinner" /> : "Bỏ qua thanh toán và gửi duyệt"}
                  </button>
                  <button
                    className="btn btn-primary student-courses__payment-btn"
                    onClick={() => submitEnrollment(true)}
                    disabled={enrolling}
                  >
                    {enrolling ? <span className="spinner" /> : "Xác nhận thanh toán"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
