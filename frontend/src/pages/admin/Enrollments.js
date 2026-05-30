import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import "./Admin.css";
import "./Enrollments.css";

const PAGE_SIZE = 10;

const STATUS_BADGE = {
  pending: "badge-yellow",
  approved: "badge-green",
  rejected: "badge-red",
  enrolled: "badge-blue",
  completed: "badge-gray",
  dropped: "badge-red",
};

const STATUS_LABEL = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  enrolled: "Đang học",
  completed: "Hoàn thành",
  dropped: "Đã hủy",
};

export default function AdminEnrollments() {
  // State dữ liệu gốc lấy từ backend.
  const [enrollments, setEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển bộ lọc và phân trang.
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load đồng thời nhiều nguồn để render bảng đã join dữ liệu.
  const loadAll = async () => {
    setLoading(true);
    try {
      const [enrollmentResponse, userResponse, courseResponse, classResponse] = await Promise.all([
        api.get("/enrollments"),
        api.get("/users"),
        api.get("/courses"),
        api.get("/admin/classes"),
      ]);

      setEnrollments(enrollmentResponse.data.data || []);
      setUsers(userResponse.data.data || []);
      setCourses(courseResponse.data.data || []);
      setClasses(classResponse.data.data || []);
    } catch (error) {
      console.error("Enrollment load error:", error);
      toast.error("Không thể tải dữ liệu đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Helpers tra cứu tên người dùng, khóa học và lớp học.
  const getUser = (id) => users.find((user) => Number(user.id) === Number(id));
  const getCourse = (id) => courses.find((course) => Number(course.id) === Number(id));
  const getClass = (id) => classes.find((classroom) => Number(classroom.id) === Number(id));

  // Danh sách sau lọc giúp admin xử lý đúng nhóm enrollment quan tâm.
  const filteredEnrollments = useMemo(() => (
    enrollments.filter((enrollment) => {
      const user = getUser(enrollment.userId);
      const course = getCourse(enrollment.courseId);

      const matchStatus = !statusFilter || enrollment.status === statusFilter;
      const matchSearch = !search
        || (user?.name || "").toLowerCase().includes(search.toLowerCase())
        || (user?.email || "").toLowerCase().includes(search.toLowerCase())
        || (course?.title || "").toLowerCase().includes(search.toLowerCase());

      return matchStatus && matchSearch;
    })
  ), [enrollments, users, courses, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / PAGE_SIZE));
  const paginatedEnrollments = filteredEnrollments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pendingCount = enrollments.filter((enrollment) => enrollment.status === "pending").length;
  const paidCount = enrollments.filter((enrollment) => enrollment.paid).length;

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/enrollments/${id}/approve`);
      toast.success("Đã duyệt đăng ký");
      loadAll();
    } catch {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối đăng ký này?")) {
      return;
    }

    try {
      await api.put(`/enrollments/${id}`, { status: "rejected" });
      toast.success("Đã từ chối đăng ký");
      loadAll();
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
            <option value="enrolled">📚 Đang học</option>
            <option value="rejected">❌ Từ chối</option>
            <option value="completed">🎓 Hoàn thành</option>
            <option value="dropped">🚫 Đã hủy</option>
          </select>
        </div>
        <span className="admin-enrollments__result-count">{filteredEnrollments.length} đăng ký</span>
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
                    const user = getUser(enrollment.userId);
                    const course = getCourse(enrollment.courseId);
                    const classroom = getClass(enrollment.classId);

                    return (
                      <tr key={enrollment.id}>
                        <td>
                          <div className="admin-enrollments__identity">
                            <div className="avatar">{(user?.name || "?").charAt(0).toUpperCase()}</div>
                            <div>
                              <p className="admin-enrollments__name">{user?.name || `ID: ${enrollment.userId}`}</p>
                              <p className="admin-enrollments__muted admin-enrollments__tiny">{user?.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p className="admin-enrollments__name">{course?.title || `ID: ${enrollment.courseId}`}</p>
                          {course && (
                            <span className={`badge ${course.examType === "IELTS" ? "badge-blue" : course.examType === "TOEIC" ? "badge-green" : "badge-gray"}`}>
                              {course.examType}
                            </span>
                          )}
                        </td>
                        <td className="admin-enrollments__class-cell">
                          {classroom?.name || (enrollment.classId ? `ID: ${enrollment.classId}` : "—")}
                        </td>
                        <td className="admin-enrollments__muted admin-enrollments__tiny">
                          {enrollment.enrollDate ? new Date(enrollment.enrollDate).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td>
                          {enrollment.paid ? (
                            <span className="badge badge-green">✅ Đã TT</span>
                          ) : (
                            <span className="badge badge-yellow">⏳ Chưa TT</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[enrollment.status] || "badge-gray"}`}>
                            {STATUS_LABEL[enrollment.status] || enrollment.status}
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
