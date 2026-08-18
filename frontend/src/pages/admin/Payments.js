import React, { useEffect, useMemo, useState } from "react";
import { paymentService } from "../../services/paymentService";
import { PAYMENT_METHOD_LABELS } from "../../constants/payments";
import { formatCoursePrice } from "../../utils/format";
import { ADMIN_PAYMENTS_COURSE_PAGE_SIZE, DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import toast from "react-hot-toast";
import "./Payments.css";

// 4 slot đầu của bảng màu categorical đã validate (xem skill dataviz) - dùng cố định
// theo đúng thứ tự, không cycle, để phân biệt được dù bị mù màu.
const METHOD_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100"];

const STATUS_META = {
  paid: { label: "Đã thanh toán", badge: "badge-green" },
  pending: { label: "Chờ xử lý", badge: "badge-yellow" },
  cancelled: { label: "Đã hủy", badge: "badge-red" },
};

export default function AdminPayments() {
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, paymentsData] = await Promise.all([
        paymentService.getStats().catch(() => null),
        paymentService.getAdminPayments().catch(() => []),
      ]);
      setStats(statsData);
      setPayments(paymentsData || []);
    } catch {
      toast.error("Không thể tải dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const methodChartData = useMemo(() => (
    (stats?.revenueByMethod || []).map((item, index) => ({
      name: PAYMENT_METHOD_LABELS[item.label] || item.label,
      value: Number(item.amount || 0),
      fill: METHOD_COLORS[index % METHOD_COLORS.length],
    }))
  ), [stats]);

  const allCourses = useMemo(() => (
    stats?.revenueByCourse || []
  ), [stats]);

  const maxCourseRevenue = useMemo(() => (
    Math.max(1, ...allCourses.map((item) => Number(item.amount || 0)))
  ), [allCourses]);

  const courseTotalPages = Math.max(1, Math.ceil(allCourses.length / ADMIN_PAYMENTS_COURSE_PAGE_SIZE));
  const paginatedCourses = allCourses.slice(
    (coursePage - 1) * ADMIN_PAYMENTS_COURSE_PAGE_SIZE,
    coursePage * ADMIN_PAYMENTS_COURSE_PAGE_SIZE
  );

  useEffect(() => {
    if (coursePage > courseTotalPages) {
      setCoursePage(courseTotalPages);
    }
  }, [coursePage, courseTotalPages]);

  const visiblePayments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesStatus = !statusFilter || payment.status === statusFilter;
      const matchesKeyword = !keyword
        || String(payment.userName || "").toLowerCase().includes(keyword)
        || String(payment.userEmail || "").toLowerCase().includes(keyword)
        || String(payment.courseName || "").toLowerCase().includes(keyword);
      return matchesStatus && matchesKeyword;
    });
  }, [payments, search, statusFilter]);

  const paymentTotalPages = Math.max(1, Math.ceil(visiblePayments.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedPayments = visiblePayments.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);

  useEffect(() => {
    if (page > paymentTotalPages) {
      setPage(paymentTotalPages);
    }
  }, [page, paymentTotalPages]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in admin-payments">
      <div className="page-header">
        <div>
          <h1>Thanh toán & doanh thu</h1>
          <p className="admin-payments__subtitle">Theo dõi doanh thu đã thu, khoản chờ xử lý và từng giao dịch.</p>
        </div>
      </div>

      <section className="stats-grid admin-payments__grid">
        <article className="stat-card">

          <div className="stat-body">
            <p className="stat-label">Tổng doanh thu đã thu</p>
            <h3 className="stat-value">{formatCoursePrice(stats?.totalRevenue)}</h3>
            <p className="stat-sub">{stats?.paidCount || 0} giao dịch</p>
          </div>
        </article>
        <article className="stat-card">

          <div className="stat-body">
            <p className="stat-label">Đang chờ xử lý</p>
            <h3 className="stat-value">{formatCoursePrice(stats?.pendingAmount)}</h3>
            <p className="stat-sub">{stats?.pendingCount || 0} giao dịch</p>
          </div>
        </article>
      </section>

      <section className="admin-payments__content">
        <div className="section-card admin-payments__chart-card">
          <h3 className="section-title">Doanh thu theo phương thức</h3>
          {methodChartData.length === 0 ? (
            <div className="empty-state"><p>Chưa có doanh thu để hiển thị</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={methodChartData} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  formatter={(value) => formatCoursePrice(value)}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {methodChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="section-card admin-payments__course-card">
          <h3 className="section-title">Doanh thu theo khóa học</h3>
          {allCourses.length === 0 ? (
            <div className="empty-state"><p>Chưa có dữ liệu</p></div>
          ) : (
            <>
              <div className="admin-payments__course-list">
                {paginatedCourses.map((item) => (
                  <div key={item.label} className="admin-payments__course-row">
                    <div className="admin-payments__course-head">
                      <span>{item.label}</span>
                      <strong>{formatCoursePrice(item.amount)}</strong>
                    </div>
                    <div className="admin-payments__course-bar-track">
                      <div
                        className="admin-payments__course-bar-fill"
                        style={{ width: `${Math.max(4, (Number(item.amount || 0) / maxCourseRevenue) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {courseTotalPages > 1 && (
                <div className="pagination admin-payments__course-pagination">
                  <span className="pagination-info">Trang {coursePage}/{courseTotalPages}</span>
                  <div className="pagination-btns">
                    <button className="page-btn" disabled={coursePage === 1} onClick={() => setCoursePage((current) => current - 1)}>‹</button>
                    <button className="page-btn" disabled={coursePage === courseTotalPages} onClick={() => setCoursePage((current) => current + 1)}>›</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="section-card admin-payments__table-card">
        <div className="admin-payments__table-head">
          <h3 className="section-title">Danh sách giao dịch</h3>
          <div className="admin-payments__filters">
            <input
              className="search-input"
              placeholder="🔍 Tìm học viên, email, khóa học..."
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            />
            <select className="filter-select" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
              <option value="">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ xử lý</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Khóa học</th>
                <th>Lớp</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Không có giao dịch phù hợp</p></td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <p className="admin-payments__student-name">{payment.userName || "—"}</p>
                      <p className="admin-payments__muted">{payment.userEmail}</p>
                    </td>
                    <td>{payment.courseName || "—"}</td>
                    <td>{payment.className || "—"}</td>
                    <td>{formatCoursePrice(payment.amount)}</td>
                    <td>{PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || "—"}</td>
                    <td>
                      <span className={`badge ${STATUS_META[payment.status]?.badge || "badge-gray"}`}>
                        {STATUS_META[payment.status]?.label || payment.status}
                      </span>
                    </td>
                    <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {paymentTotalPages > 1 && (
          <div className="pagination admin-payments__table-pagination">
            <span className="pagination-info">Trang {page}/{paymentTotalPages} — {visiblePayments.length} giao dịch</span>
            <div className="pagination-btns">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>‹</button>
              {Array.from({ length: Math.min(paymentTotalPages, 5) }, (_, index) => {
                const pageNumber = page <= 3 ? index + 1 : page - 2 + index;
                if (pageNumber < 1 || pageNumber > paymentTotalPages) {
                  return null;
                }
                return (
                  <button key={pageNumber} className={`page-btn ${page === pageNumber ? "active" : ""}`} onClick={() => setPage(pageNumber)}>
                    {pageNumber}
                  </button>
                );
              })}
              <button className="page-btn" disabled={page === paymentTotalPages} onClick={() => setPage((current) => current + 1)}>›</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
