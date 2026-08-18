import React, { useEffect, useMemo, useState } from "react";
import { paymentService } from "../../services/paymentService";
import { PAYMENT_METHOD_LABELS } from "../../constants/payments";
import { formatCoursePrice } from "../../utils/format";
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

  const topCourses = useMemo(() => (
    [...(stats?.revenueByCourse || [])].slice(0, 8)
  ), [stats]);

  const maxCourseRevenue = useMemo(() => (
    Math.max(1, ...topCourses.map((item) => Number(item.amount || 0)))
  ), [topCourses]);

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
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <p className="stat-label">Tổng doanh thu đã thu</p>
            <h3 className="stat-value">{formatCoursePrice(stats?.totalRevenue)}</h3>
            <p className="stat-sub">{stats?.paidCount || 0} giao dịch</p>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-icon">⏳</div>
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
          <h3 className="section-title">Top khóa học theo doanh thu</h3>
          {topCourses.length === 0 ? (
            <div className="empty-state"><p>Chưa có dữ liệu</p></div>
          ) : (
            <div className="admin-payments__course-list">
              {topCourses.map((item) => (
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
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
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
              {visiblePayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state"><p>Không có giao dịch phù hợp</p></td>
                </tr>
              ) : (
                visiblePayments.map((payment) => (
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
      </section>
    </div>
  );
}
