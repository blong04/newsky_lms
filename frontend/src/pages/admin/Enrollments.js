import React, { useEffect, useState } from "react";
import { enrollmentService } from "../../services/enrollmentService";
import { ENROLLMENT_STATUS_BADGES, ENROLLMENT_STATUS_LABELS } from "../../constants/enrollments";
import { getExamBadgeClass } from "../../constants/courses";
import { PAYMENT_METHOD_LABELS } from "../../constants/payments";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Enrollments.css";

export default function AdminEnrollments() {
  // State dữ liệu gốc lấy từ backend.
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển bộ lọc và phân trang.
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load danh sách đăng ký đã join sẵn theo bộ lọc từ backend.
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const enrollmentData = await enrollmentService.getAdminDetails({
          keyword: search.trim() || undefined,
          status: statusFilter || undefined,
        });
        setEnrollments(enrollmentData || []);
      } catch (error) {
        console.error("Enrollment load error:", error);
        toast.error("Không thể tải dữ liệu đăng ký");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search, statusFilter]);

  // Giữ số trang luôn hợp lệ sau khi dữ liệu lọc từ backend thay đổi.
  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(enrollments.length / DEFAULT_TABLE_PAGE_SIZE));
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [page, enrollments]);

  const totalPages = Math.max(1, Math.ceil(enrollments.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedEnrollments = enrollments.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);

  const pendingCount = enrollments.filter((enrollment) => enrollment.status === "pending").length;
  const paidCount = enrollments.filter((enrollment) => enrollment.paid).length;

  const handleApprove = async (id) => {
    try {
      await enrollmentService.approve(id);
      toast.success("Đã duyệt đăng ký");
      const enrollmentData = await enrollmentService.getAdminDetails({
        keyword: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setEnrollments(enrollmentData || []);
    } catch {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối đăng ký này?")) {
      return;
    }

    try {
      await enrollmentService.updateStatus(id, { status: "rejected" });
      toast.success("Đã từ chối đăng ký");
      const enrollmentData = await enrollmentService.getAdminDetails({
        keyword: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setEnrollments(enrollmentData || []);
    } catch {
      toast.error("Từ chối thất bại");
    }
  };

  return (
    <div className="admin-page fade-in admin-enrollments">
      <section className="admin-enrollments__hero">
        <div>
          <p className="admin-enrollments__eyebrow">Enrollment flow</p>
          <h1>Quản lý đăng ký học</h1>
          <p className="admin-enrollments__subtitle">
            Theo dõi luồng đăng ký khóa học, xác nhận thanh toán và phê duyệt học viên vào lớp phù hợp.
          </p>
        </div>
        <div className="admin-enrollments__stats">
          <article className="admin-enrollments__stat-card">
            <span>Đăng ký chờ duyệt</span>
            <strong>{pendingCount}</strong>
          </article>
          <article className="admin-enrollments__stat-card admin-enrollments__stat-card--success">
            <span>Đã thanh toán</span>
            <strong>{paidCount}</strong>
          </article>
        </div>
      </section>

      {/* Toolbar lọc nhanh các yêu cầu đăng ký cần admin xử lý. */}
      <div className="toolbar admin-enrollments__toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="🔍 Tìm tên, email hoặc khóa học"
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
            <option value="">Tất cả</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="approved">✅ Đã duyệt</option>
            <option value="rejected">❌ Từ chối</option>
            <option value="completed">🎓 Hoàn thành</option>
            <option value="cancelled">🚫 Đã hủy</option>
          </select>
        </div>
        <span className="admin-enrollments__result-count">{enrollments.length} đăng ký</span>
      </div>

      {/* Bảng join dữ liệu enrollment với user, course và class để xem một nơi. */}
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
                  <th>Ngày đăng ký</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state"><p>Không có dữ liệu đăng ký</p></td>
                  </tr>
                ) : (
                  paginatedEnrollments.map((enrollment) => {
                    return (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="admin-enrollments__identity">
                            <div className="avatar">{(enrollment.userName || "?").charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="admin-enrollments__name">{enrollment.userName || `ID: ${enrollment.userId}`}</p>
                              <p className="admin-enrollments__muted admin-enrollments__tiny">{enrollment.userEmail || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="admin-enrollments__name">{enrollment.courseName || `ID: ${enrollment.courseId}`}</p>
                          
                        </td>
                        <td className="admin-enrollments__class-cell">
                          {enrollment.className || (enrollment.classId ? `ID: ${enrollment.classId}` : "—")}
                        </td>
                        <td className="admin-enrollments__muted admin-enrollments__tiny">
                          {enrollment.enrollDate ? new Date(enrollment.enrollDate).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td>
                          {enrollment.paid ? (
                            <div>
                              <span className="badge badge-green">✅ Đã TT</span>
                              {enrollment.paymentMethod && (
                                <p className="admin-enrollments__muted admin-enrollments__tiny">
                                  {PAYMENT_METHOD_LABELS[enrollment.paymentMethod] || enrollment.paymentMethod}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className={`badge ${enrollment.paymentStatus === "failed" ? "badge-red" : "badge-yellow"}`}>
                                {enrollment.paymentStatus === "failed" ? "❌ Lỗi TT" : "⏳ Chưa TT"}
                              </span>
                              
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${ENROLLMENT_STATUS_BADGES[enrollment.status] || "badge-gray"}`}>
                            {ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status}
                          </span>
                        </td>
                        <td>
                          <div className="admin-enrollments__actions">
                            {enrollment.status === "pending" && (
                              <>
                                <button className="btn btn-success btn-sm" onClick={() => handleApprove(enrollment.id)}>✅</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReject(enrollment.id)}>❌</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {enrollments.length > DEFAULT_TABLE_PAGE_SIZE && (
              <div className="pagination">
                <span className="pagination-info">
                  {((page - 1) * DEFAULT_TABLE_PAGE_SIZE) + 1}–{Math.min(page * DEFAULT_TABLE_PAGE_SIZE, enrollments.length)} / {enrollments.length}
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
