import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
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
import "./Dashboard.css";

const FALLBACK_STATS = {
  totalUsers: 0,
  totalStudents: 0,
  totalTeachers: 0,
  pendingTeachers: 0,
  totalCourses: 0,
  activeClasses: 0,
  pendingEnrollments: 0,
};

const STAT_CARDS = [
  { key: "totalUsers", icon: "👥", label: "Tổng người dùng", color: "#2563eb", tone: "users" },
  { key: "totalStudents", icon: "👨‍🎓", label: "Học viên", color: "#16a34a", tone: "students" },
  { key: "totalTeachers", icon: "👨‍🏫", label: "Giáo viên", color: "#0ea5e9", tone: "teachers" },
  { key: "totalCourses", icon: "📚", label: "Khóa học", color: "#d97706", tone: "courses" },
  { key: "activeClasses", icon: "🏫", label: "Lớp đang học", color: "#7c3aed", tone: "classes" },
  { key: "pendingEnrollments", icon: "⏳", label: "Chờ đăng ký duyệt", color: "#dc2626", tone: "enrollments" },
];

function StatCard({ icon, label, value, color, sub, tone }) {
  return (
    <article className={`stat-card admin-dashboard__stat-card admin-dashboard__stat-card--${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
      <span className="admin-dashboard__stat-glow" />
    </article>
  );
}

export default function AdminDashboard() {
  // State tổng hợp cho dashboard.
  const [stats, setStats] = useState(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);

  // Load số liệu hệ thống khi vào dashboard.
  useEffect(() => {
    dashboardService.getAdminStats()
      .then((response) => setStats(response || FALLBACK_STATS))
      .catch(() => setStats(FALLBACK_STATS))
      .finally(() => setLoading(false));
  }, []);

  // Dữ liệu biểu đồ giúp admin nhìn nhanh phân bố hệ thống.
  const chartData = [
    { name: "Học viên", value: stats.totalStudents, fill: "#2563eb" },
    { name: "Giáo viên", value: stats.totalTeachers, fill: "#0ea5e9" },
    { name: "Khóa học", value: stats.totalCourses, fill: "#16a34a" },
    { name: "Lớp hoạt động", value: stats.activeClasses, fill: "#d97706" },
  ];

  const quickNotes = [
    {
      title: "Đội ngũ giảng dạy",
      value: `${stats.totalTeachers} giáo viên`,
      note: stats.pendingTeachers > 0 ? `${stats.pendingTeachers} hồ sơ cần duyệt` : "Không có hồ sơ chờ",
      tone: "teachers",
    },
    {
      title: "Vận hành lớp học",
      value: `${stats.activeClasses} lớp`,
      note: `${stats.pendingEnrollments} yêu cầu đăng ký chờ xử lý`,
      tone: "classes",
    },
  ];

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in admin-dashboard">
      <section className="admin-dashboard__hero">
        <div>
          <p className="admin-dashboard__eyebrow">System overview</p>
          <h1>Dashboard quản trị NewSky English</h1>
          <p className="admin-dashboard__subtitle">
            Theo dõi nhanh tình trạng vận hành, số lượng người dùng và các khu vực cần xử lý trước.
          </p>
        </div>
        <div className="admin-dashboard__notes">
          {quickNotes.map((item) => (
            <article key={item.title} className={`admin-dashboard__note admin-dashboard__note--${item.tone}`}>
              <p className="admin-dashboard__note-title">{item.title}</p>
              <strong>{item.value}</strong>
              <span>{item.note}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-grid admin-dashboard__grid">
        {STAT_CARDS.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={stats[card.key]}
            color={card.color}
            tone={card.tone}
            sub={card.key === "totalTeachers" && stats.pendingTeachers > 0 ? `${stats.pendingTeachers} chờ duyệt` : null}
          />
        ))}
      </section>

      <section className="admin-dashboard__content">
        <div className="section-card admin-dashboard__chart-card">
          <div className="admin-dashboard__section-head">
            <div>
              <p className="admin-dashboard__section-kicker">Phân bổ dữ liệu</p>
              <h3 className="section-title">Thống kê hệ thống</h3>
            </div>
            <span className="badge badge-blue">Realtime snapshot</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card admin-dashboard__summary-card">
          <p className="admin-dashboard__section-kicker">Ưu tiên hôm nay</p>
          <h3 className="section-title">Điểm cần chú ý</h3>
          <div className="admin-dashboard__summary-list">
            <div className="admin-dashboard__summary-item">
              <span className="admin-dashboard__summary-icon">🧑‍🏫</span>
              <div>
                <strong>{stats.pendingTeachers}</strong>
                <p>Giáo viên đang chờ phê duyệt tài khoản</p>
              </div>
            </div>
            <div className="admin-dashboard__summary-item">
              <span className="admin-dashboard__summary-icon">📝</span>
              <div>
                <strong>{stats.pendingEnrollments}</strong>
                <p>Yêu cầu đăng ký nên xử lý để tránh tồn đọng</p>
              </div>
            </div>
            <div className="admin-dashboard__summary-item">
              <span className="admin-dashboard__summary-icon">📈</span>
              <div>
                <strong>{stats.totalUsers}</strong>
                <p>Tổng thành viên đang được hệ thống quản lý</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
