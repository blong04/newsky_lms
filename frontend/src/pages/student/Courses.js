import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { classService } from "../../services/classService";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { officialExamResultService } from "../../services/officialExamResultService";
import { paymentService } from "../../services/paymentService";
import { CLASS_STATUS_BADGES, CLASS_STATUS_LABELS } from "../../constants/classes";
import { LEVEL_LABELS } from "../../constants/courses";
import { ENROLLMENT_STATUS_META } from "../../constants/enrollments";
import { INSTANT_PAYMENT_METHODS, PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS } from "../../constants/payments";
import { STUDENT_COURSE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Courses.css";

export default function StudentCourses() {
  const { user } = useAuth();

  // State dữ liệu gợi ý khóa học, lớp học, ghi danh và kết quả thi chính thức.
  const [recommendationBundle, setRecommendationBundle] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [officialResults, setOfficialResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // State lọc và phân trang danh sách khóa học gợi ý.
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [enrollFilter, setEnrollFilter] = useState("");
  const [page, setPage] = useState(1);

  // State modal xem chi tiết, đăng ký khóa học và nhập điểm thi chính thức.
  const [detailModal, setDetailModal] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showPaymentView, setShowPaymentView] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const [officialModalCourse, setOfficialModalCourse] = useState(null);
  const [officialSaving, setOfficialSaving] = useState(false);
  const [officialFeedback, setOfficialFeedback] = useState(null);
  const [retakeClassId, setRetakeClassId] = useState("");
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [officialForm, setOfficialForm] = useState({
    score: "",
    examDate: "",
    note: "",
  });

  // Load đồng thời gợi ý khóa học, các lớp, enrollment hiện có và điểm thi chính thức.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [recommendedData, enrollmentData, classData, officialResultData] = await Promise.all([
          courseService.getRecommended(),
          enrollmentService.getStudentEnrollments().catch(() => []),
          classService.getPublicClasses().catch(() => []),
          officialExamResultService.getMine().catch(() => []),
        ]);

        setRecommendationBundle(recommendedData || null);
        setEnrollments(enrollmentData || []);
        setClasses(classData || []);
        setOfficialResults(officialResultData || []);
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải lộ trình khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recommendedCourses = recommendationBundle?.recommendedCourses || [];
  const nextLevelCourses = recommendationBundle?.nextLevelCourses || [];

  const allSuggestedCourses = useMemo(() => ([
    ...recommendedCourses.map((course) => ({ ...course, suggestionType: "current" })),
    ...nextLevelCourses.map((course) => ({ ...course, suggestionType: "next" })),
  ]), [recommendedCourses, nextLevelCourses]);

  const officialResultsByCourseId = useMemo(() => (
    officialResults.reduce((resultMap, result) => {
      const current = resultMap[result.courseId];
      if (!current || new Date(result.examDate || 0) > new Date(current.examDate || 0)) {
        resultMap[result.courseId] = result;
      }
      return resultMap;
    }, {})
  ), [officialResults]);

  // Chỉ xem enrollment còn hiệu lực là đã đăng ký; rejected/cancelled được xem như có thể thao tác lại.
  const getEnrollment = (courseId) => enrollments.find((item) =>
    Number(item.courseId) === Number(courseId) && !["cancelled", "rejected"].includes(item.status)
  );

  const getCourseClasses = (courseId) => classes.filter((item) => Number(item.courseId) === Number(courseId));

  const getAvailableClasses = (courseId) => classes.filter((item) =>
    Number(item.courseId) === Number(courseId)
    && item.status === "pending"
    && (item.currentStudents || 0) < (item.maxStudents || 999)
  );

  const getFreeRetakeClasses = (courseId) => classes.filter((item) =>
    Number(item.courseId) === Number(courseId)
    && ["pending", "active"].includes(item.status)
    && (item.currentStudents || 0) < (item.maxStudents || 999)
  );

  const visibleCourses = allSuggestedCourses.filter((course) => {
    const enrollment = getEnrollment(course.id);
    const keyword = search.trim().toLowerCase();
    const matchesKeyword = !keyword
      || String(course.title || "").toLowerCase().includes(keyword)
      || String(course.description || "").toLowerCase().includes(keyword);
    const matchesLevel = !levelFilter || course.level === levelFilter;
    const matchesEnrollFilter = !enrollFilter
      || (enrollFilter === "enrolled" && enrollment)
      || (enrollFilter === "not_enrolled" && !enrollment);

    return matchesKeyword && matchesLevel && matchesEnrollFilter;
  });

  const totalPages = Math.max(1, Math.ceil(visibleCourses.length / STUDENT_COURSE_PAGE_SIZE));
  const paginatedCourses = visibleCourses.slice((page - 1) * STUDENT_COURSE_PAGE_SIZE, page * STUDENT_COURSE_PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const refreshSupportData = async () => {
    const [enrollmentData, officialResultData] = await Promise.all([
      enrollmentService.getStudentEnrollments().catch(() => []),
      officialExamResultService.getMine().catch(() => []),
    ]);
    setEnrollments(enrollmentData || []);
    setOfficialResults(officialResultData || []);
  };

  const resetEnrollmentFlow = () => {
    setEnrollModal(null);
    setSelectedClass(null);
    setShowPaymentView(false);
    setSelectedPaymentMethod("");
    setPaymentPreview(null);
  };

  const handleEnrollClick = (course) => {
    const enrollment = getEnrollment(course.id);
    if (enrollment) {
      toast("Bạn đã có ghi danh cho khóa học này");
      return;
    }

    setEnrollModal(course);
    setSelectedClass(null);
    setShowPaymentView(false);
    setSelectedPaymentMethod("");
    setPaymentPreview(null);
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
      await refreshSupportData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể hủy đăng ký");
    }
  };

  const loadPaymentPreview = async (paymentMethod) => {
    if (!selectedClass || !enrollModal) {
      return;
    }

    setPreviewLoading(true);
    try {
      const preview = await paymentService.previewStudentPayment({
        courseId: enrollModal.id,
        classId: selectedClass.id,
        paymentMethod,
      });
      setPaymentPreview(preview);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tạo QR thanh toán");
      setPaymentPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectPaymentMethod = async (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setPaymentPreview(null);
    await loadPaymentPreview(paymentMethod);
  };

  const submitEnrollment = async () => {
    if (!selectedClass) {
      toast.error("Chọn lớp học");
      return;
    }
    if (!selectedPaymentMethod) {
      toast.error("Chọn phương thức thanh toán");
      return;
    }

    setEnrolling(true);
    try {
      const isFreeCourse = Number(enrollModal.price || 0) <= 0;
      const isPaid = isFreeCourse || INSTANT_PAYMENT_METHODS.includes(selectedPaymentMethod);
      await enrollmentService.createStudentEnrollment({
        courseId: enrollModal.id,
        classId: selectedClass.id,
        paymentMethod: selectedPaymentMethod,
        paid: isPaid,
      });
      toast.success(
        isPaid
          ? "Đã ghi nhận đăng ký và thanh toán."
          : selectedPaymentMethod === "BANK_TRANSFER"
            ? "Đã ghi nhận yêu cầu chuyển khoản. Admin sẽ kiểm tra và phê duyệt."
            : "Đã gửi yêu cầu đăng ký. Vui lòng chờ admin phê duyệt."
      );
      resetEnrollmentFlow();
      await refreshSupportData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể đăng ký khóa học");
    } finally {
      setEnrolling(false);
    }
  };

  const openOfficialResultModal = (course) => {
    setOfficialModalCourse(course);
    setOfficialForm({ score: "", examDate: "", note: "" });
    setOfficialFeedback(null);
    setRetakeClassId("");
  };

  const closeOfficialResultModal = () => {
    setOfficialModalCourse(null);
    setOfficialFeedback(null);
    setRetakeClassId("");
  };

  const submitOfficialResult = async () => {
    if (!officialModalCourse) {
      return;
    }
    if (!officialForm.score || !officialForm.examDate) {
      toast.error("Hãy nhập điểm và ngày thi");
      return;
    }

    setOfficialSaving(true);
    try {
      const response = await officialExamResultService.create({
        courseId: officialModalCourse.id,
        examType: officialModalCourse.examType,
        score: Number(officialForm.score),
        examDate: officialForm.examDate,
        note: officialForm.note,
      });
      setOfficialFeedback(response);
      await refreshSupportData();
      toast.success("Đã lưu kết quả thi chính thức");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu kết quả thi");
    } finally {
      setOfficialSaving(false);
    }
  };

  const requestFreeRetake = async () => {
    if (!officialFeedback?.sourceEnrollmentId) {
      toast.error("Không tìm thấy enrollment gốc để yêu cầu học lại");
      return;
    }
    if (!retakeClassId) {
      toast.error("Hãy chọn lớp muốn học lại");
      return;
    }

    setRetakeLoading(true);
    try {
      await enrollmentService.requestFreeRetake(officialFeedback.sourceEnrollmentId, {
        classId: Number(retakeClassId),
      });
      toast.success("Đã gửi yêu cầu học lại miễn phí");
      closeOfficialResultModal();
      await refreshSupportData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi yêu cầu học lại");
    } finally {
      setRetakeLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  if (!recommendationBundle?.placementCompleted) {
    return (
      <div className="admin-page fade-in student-courses">
        <div className="empty-state">
          <p>Bạn cần hoàn thành bài thi xếp lớp trước khi xem lộ trình khóa học.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page fade-in student-courses">
      <section className="student-courses__hero">
        <div>
          <p className="student-courses__hero-eyebrow">Recommended learning path</p>
          <h1>Khóa học phù hợp với kết quả đầu vào</h1>
          <p className="student-courses__hero-subtitle">
            Hệ thống đang gợi ý các khóa học dựa trên bài thi xếp lớp {recommendationBundle.placementExamType}. Bạn vẫn có thể đăng ký lớp, nhập điểm thi chính thức sau khóa học và gửi yêu cầu học lại miễn phí nếu đủ điều kiện.
          </p>
        </div>
        <div className="student-courses__hero-card">
          <span>Kết quả đầu vào</span>
          <strong>
            {recommendationBundle.placementExamType === "IELTS"
              ? `Band ${Number(recommendationBundle.placementScore || 0).toFixed(1)}`
              : `${Number(recommendationBundle.placementScore || 0).toFixed(0)} điểm`}
          </strong>
          <p>{recommendationBundle.recommendedCourses?.length || 0} khóa phù hợp hiện tại và {recommendationBundle.nextLevelCourses?.length || 0} khóa cho lộ trình tiếp theo.</p>
        </div>
      </section>

      <div className="student-courses__summary-grid">
        <article className="student-courses__summary-card">
          <p className="student-courses__summary-label">Phù hợp hiện tại</p>
          <strong>{recommendedCourses.length} khóa</strong>
        </article>
        <article className="student-courses__summary-card">
          <p className="student-courses__summary-label">Lộ trình kế tiếp</p>
          <strong>{nextLevelCourses.length} khóa</strong>
        </article>
        <article className="student-courses__summary-card">
          <p className="student-courses__summary-label">Điểm thi chính thức đã nhập</p>
          <strong>{officialResults.length} kết quả</strong>
        </article>
      </div>

      <div className="courses-sticky-bar student-courses__sticky-bar">
        <div className="courses-sticky-inner student-courses__sticky-inner">
          <h2 className="student-courses__heading">
            Lộ trình khóa học <span className="student-courses__heading-count">({visibleCourses.length})</span>
          </h2>
          <div className="student-courses__filters">
            <input
              className="search-input student-courses__search"
              placeholder="🔍 Tìm khóa học..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <select className="filter-select" value={levelFilter} onChange={(event) => { setLevelFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả cấp độ</option>
              <option value="beginner">Cơ bản</option>
              <option value="intermediate">Trung cấp</option>
              <option value="advanced">Nâng cao</option>
            </select>
            <select className="filter-select" value={enrollFilter} onChange={(event) => { setEnrollFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="enrolled">Đã ghi danh</option>
              <option value="not_enrolled">Chưa ghi danh</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper student-courses__table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Khóa học</th>
              <th>Nhóm gợi ý</th>
              <th>Mức điểm khuyến nghị</th>
              <th>Học phí</th>
              <th>Ghi danh</th>
              <th>Điểm thi chính thức</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCourses.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state"><p>Không có khóa học nào phù hợp với bộ lọc hiện tại</p></td>
              </tr>
            ) : (
              paginatedCourses.map((course) => {
                const enrollment = getEnrollment(course.id);
                const latestOfficialResult = officialResultsByCourseId[course.id];

                return (
                  <tr key={`${course.suggestionType}-${course.id}`}>
                    <td>
                      <p className="student-courses__course-title">{course.title}</p>
                      <p className="student-courses__course-note">{course.description?.slice(0, 80)}{course.description?.length > 80 ? "..." : ""}</p>
                    </td>
                    <td>
                      <span className={`badge ${course.suggestionType === "current" ? "badge-green" : "badge-blue"}`}>
                        {course.suggestionType === "current" ? "Phù hợp hiện tại" : "Gợi ý tiếp theo"}
                      </span>
                      <p className="student-courses__tiny-note">{course.recommendationReason}</p>
                    </td>
                    <td>
                      {course.recommendedScoreMin != null || course.recommendedScoreMax != null ? (
                        <span className="student-courses__range">
                          {course.recommendedScoreMin ?? "0"} - {course.recommendedScoreMax ?? "∞"}
                        </span>
                      ) : (
                        <span className="student-courses__tiny-note">Chưa cấu hình</span>
                      )}
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
                      {latestOfficialResult ? (
                        <div>
                          <strong className="student-courses__official-score">{latestOfficialResult.score}</strong>
                          <p className="student-courses__tiny-note">{new Date(latestOfficialResult.examDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                      ) : (
                        <span className="student-courses__tiny-note">Chưa nhập</span>
                      )}
                    </td>
                    <td>
                      <div className="student-courses__actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailModal(course)}>Chi tiết</button>
                        {!enrollment && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleEnrollClick(course)}>Đăng ký</button>
                        )}
                        {enrollment?.status === "pending" && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelEnroll(enrollment)}>Hủy</button>
                        )}
                        {enrollment && (
                          <button className="btn btn-ghost btn-sm" onClick={() => openOfficialResultModal(course)}>Điểm thi</button>
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
          <span className="pagination-info">Trang {page}/{totalPages} — {visibleCourses.length} khóa học</span>
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
                  <p className="student-courses__detail-label">Mục tiêu khóa học</p>
                  <p className="student-courses__detail-value">
                    {detailModal.targetScore != null ? detailModal.targetScore : "Chưa cấu hình"}
                  </p>
                  <p className="student-courses__detail-label student-courses__detail-label--spaced">Miễn phí học lại</p>
                  <p className="student-courses__detail-value">{detailModal.freeRetakeMonths || 6} tháng</p>
                </div>
              </div>

              <h4 className="student-courses__detail-section-title">🏫 Các lớp học</h4>
              {getCourseClasses(detailModal.id).length === 0 ? (
                <p className="student-courses__empty-inline">Chưa có lớp nào</p>
              ) : (
                getCourseClasses(detailModal.id).map((classroom) => {
                  const myEnrollment = enrollments.find((item) => Number(item.classId) === Number(classroom.id));
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
                        {myEnrollment && (
                          <p className="student-courses__class-enroll-status">
                            <span className={`badge ${ENROLLMENT_STATUS_META[myEnrollment.status]?.badge}`}>{ENROLLMENT_STATUS_META[myEnrollment.status]?.label}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {enrollModal && (
        <div className="modal-overlay" onClick={resetEnrollmentFlow}>
          <div className="modal student-courses__select-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="student-courses__detail-eyebrow">Đăng ký khóa học</p>
                <h3>{enrollModal.title}</h3>
              </div>
              <button className="modal-close" onClick={resetEnrollmentFlow}>✕</button>
            </div>
            <div className="modal-body">
              {!showPaymentView ? (
                <>
                  <p className="student-courses__modal-note">Chọn một lớp đang tuyển để tiếp tục đăng ký.</p>
                  {getAvailableClasses(enrollModal.id).length === 0 ? (
                    <div className="student-courses__empty-inline student-courses__empty-inline--center">
                      Không có lớp đang tuyển
                    </div>
                  ) : (
                    getAvailableClasses(enrollModal.id).map((classroom) => {
                      const selected = Number(selectedClass?.id) === Number(classroom.id);
                      return (
                        <div
                          key={classroom.id}
                          className={`class-select-item ${selected ? "selected" : ""}`}
                          onClick={() => setSelectedClass(selected ? null : classroom)}
                        >
                          <div className="student-courses__select-head">
                            <div>
                              <p className="student-courses__class-name">{classroom.name}</p>
                              <p className="student-courses__class-meta">
                                📅 {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString("vi-VN") : "—"} → {classroom.endDate ? new Date(classroom.endDate).toLocaleDateString("vi-VN") : "—"}
                              </p>
                              <p className="student-courses__class-meta">👥 {classroom.currentStudents || 0}/{classroom.maxStudents}</p>
                            </div>
                            <div className={`radio-circle ${selected ? "checked" : ""}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </>
              ) : (
                <>
                  <div className="student-courses__payment-summary">
                    <p className="student-courses__detail-label">Khóa học đã chọn</p>
                    <p className="student-courses__class-name">{enrollModal.title}</p>
                    <p className="student-courses__class-meta">Lớp: {selectedClass?.name}</p>
                    <div className="student-courses__payment-total">
                      <span>Tổng thanh toán</span>
                      <span className="student-courses__payment-price">
                        {Number(enrollModal.price || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  </div>

                  <div className="student-courses__payment-methods">
                    {PAYMENT_METHOD_OPTIONS.map((method) => (
                      <button
                        type="button"
                        key={method.value}
                        className={`student-courses__payment-method ${selectedPaymentMethod === method.value ? "student-courses__payment-method--selected" : ""}`}
                        onClick={() => handleSelectPaymentMethod(method.value)}
                      >
                        <span className="student-courses__payment-icon">{method.icon}</span>
                        <div className="student-courses__payment-copy">
                          <div className="student-courses__payment-method-name">{method.label}</div>
                          <div className="student-courses__payment-method-desc">{method.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {previewLoading && <div className="student-courses__qr-loading"><div className="spinner" /></div>}

                  {!previewLoading && selectedPaymentMethod && paymentPreview?.qrCodeUrl && (
                    <div className="student-courses__qr-panel">
                      <div className="student-courses__qr-head">
                        <div>
                          <p className="student-courses__payment-title">QR thanh toán mô phỏng</p>
                          <p className="student-courses__class-meta">
                            {PAYMENT_METHOD_LABELS[selectedPaymentMethod] || selectedPaymentMethod}
                          </p>
                        </div>
                      </div>
                      <img src={paymentPreview.qrCodeUrl} alt="QR thanh toán" className="student-courses__qr-image" />
                    </div>
                  )}

                  {selectedPaymentMethod === "DEFERRED" && (
                    <div className="student-courses__payment-warning">
                      Bạn chọn bỏ qua thanh toán. Hệ thống sẽ tạo đơn chờ admin phê duyệt trước khi bạn tham gia lớp học.
                    </div>
                  )}
                </>
              )}
            </div>
            <div className={`modal-footer ${showPaymentView ? "student-courses__payment-footer" : ""}`}>
              {!showPaymentView ? (
                <>
                  <button className="btn btn-ghost" onClick={resetEnrollmentFlow}>Đóng</button>
                  <button className="btn btn-primary" disabled={!selectedClass} onClick={() => setShowPaymentView(true)}>
                    Tiếp tục thanh toán
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-ghost student-courses__payment-btn" onClick={() => setShowPaymentView(false)}>Quay lại chọn lớp</button>
                  <button className="btn btn-primary student-courses__payment-btn" disabled={enrolling} onClick={submitEnrollment}>
                    {enrolling ? "Đang gửi..." : "Hoàn tất đăng ký"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {officialModalCourse && (
        <div className="modal-overlay" onClick={closeOfficialResultModal}>
          <div className="modal student-courses__official-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="student-courses__detail-eyebrow">Kết quả thi chính thức</p>
                <h3>{officialModalCourse.title}</h3>
              </div>
              <button className="modal-close" onClick={closeOfficialResultModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="student-courses__official-grid">
                <label className="student-courses__field">
                  <span>Điểm thi</span>
                  <input
                    type="number"
                    step="0.1"
                    value={officialForm.score}
                    onChange={(event) => setOfficialForm((current) => ({ ...current, score: event.target.value }))}
                    placeholder={officialModalCourse.examType === "IELTS" ? "Ví dụ 6.5" : "Ví dụ 650"}
                  />
                </label>
                <label className="student-courses__field">
                  <span>Ngày thi chính thức</span>
                  <input
                    type="date"
                    value={officialForm.examDate}
                    onChange={(event) => setOfficialForm((current) => ({ ...current, examDate: event.target.value }))}
                  />
                </label>
              </div>
              <label className="student-courses__field">
                <span>Ghi chú</span>
                <textarea
                  rows={4}
                  value={officialForm.note}
                  onChange={(event) => setOfficialForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Ví dụ: thi tại IIG, kết quả chính thức nhận ngày..."
                />
              </label>

              {officialFeedback && (
                <div className="student-courses__official-feedback">
                  <p className="student-courses__official-feedback-title">Đánh giá sau khi lưu kết quả</p>
                  {officialFeedback.eligibleForFreeRetake ? (
                    <p className="student-courses__official-warning">
                      Điểm hiện tại chưa đạt mục tiêu của khóa học. Bạn đủ điều kiện xin học lại miễn phí nếu chọn lớp phù hợp.
                    </p>
                  ) : (
                    <p className="student-courses__official-success">
                      Kết quả đã được lưu. Nếu điểm đạt mục tiêu, hệ thống sẽ gợi ý thêm khóa học cao hơn ở bên dưới.
                    </p>
                  )}

                  {officialFeedback.nextCourseSuggestions?.length > 0 && (
                    <div className="student-courses__next-course-box">
                      <p className="student-courses__payment-title">Khóa học nên học tiếp</p>
                      <ul className="student-courses__next-course-list">
                        {officialFeedback.nextCourseSuggestions.map((course) => (
                          <li key={course.id}>
                            <strong>{course.title}</strong>
                            <span>{course.recommendationReason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {officialFeedback.eligibleForFreeRetake && (
                    <div className="student-courses__retake-box">
                      <p className="student-courses__payment-title">Yêu cầu học lại miễn phí</p>
                      <select className="filter-select" value={retakeClassId} onChange={(event) => setRetakeClassId(event.target.value)}>
                        <option value="">Chọn lớp muốn học lại</option>
                        {getFreeRetakeClasses(officialModalCourse.id).map((classroom) => (
                          <option key={classroom.id} value={classroom.id}>
                            {classroom.name} - {classroom.startDate ? new Date(classroom.startDate).toLocaleDateString("vi-VN") : "Chưa có ngày"}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn-primary student-courses__retake-btn" disabled={retakeLoading} onClick={requestFreeRetake}>
                        {retakeLoading ? "Đang gửi..." : "Gửi yêu cầu học lại miễn phí"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeOfficialResultModal}>Đóng</button>
              <button className="btn btn-primary" disabled={officialSaving} onClick={submitOfficialResult}>
                {officialSaving ? "Đang lưu..." : "Lưu kết quả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
