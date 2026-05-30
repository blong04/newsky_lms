import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";
import "./Teacher.css";
import "./Dashboard.css";

const DASHBOARD_CARDS = [
  { icon: "🏫", label: "Lớp đang dạy", valueKey: "classCount", tone: "classrooms" },
  { icon: "📋", label: "Bài tập đã tạo", valueKey: "assignmentCount", tone: "assignments" },
  { icon: "📝", label: "Bài chờ chấm", valueKey: "pendingCount", tone: "grading" },
];

export default function TeacherDashboard() {
  const { user } = useAuth();

  // State dữ liệu tổng quan của giáo viên.
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState({
    classCount: 0,
    assignmentCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load danh sách lớp phụ trách để render overview ban đầu.
  useEffect(() => {
    Promise.all([
      api.get("/teacher/classes").catch(() => ({ data: { data: [] } })),
      api.get("/teacher/dashboard").catch(() => ({ data: { data: null } })),
    ])
      .then(([classResponse, summaryResponse]) => {
        setClasses(classResponse.data.data || []);
        setSummary(summaryResponse.data.data || {
          classCount: 0,
          assignmentCount: 0,
          pendingCount: 0,
        });
      })
      .catch(() => {
        setClasses([]);
        setSummary({
          classCount: 0,
          assignmentCount: 0,
          pendingCount: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const dashboardSummary = useMemo(() => ({
    classCount: summary.classCount ?? classes.length,
    assignmentCount: summary.assignmentCount ?? 0,
    pendingCount: summary.pendingCount ?? 0,
  }), [classes.length, summary]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in teacher-dashboard">
      <section className="teacher-dashboard__hero">
        <div>
          <p className="teacher-dashboard__eyebrow">Teaching overview</p>
          <h1>Xin chào, {user?.name}</h1>
          <p className="teacher-dashboard__subtitle">
            Đây là không gian làm việc để bạn theo dõi lớp đang phụ trách và điều phối các hoạt động giảng dạy hằng ngày.
          </p>
        </div>
        <div className="teacher-dashboard__hero-card">
          <span>Hôm nay</span>
          <strong>{dashboardSummary.classCount} lớp đang được phân công</strong>
          <p>Danh sách bên dưới giúp bạn mở nhanh sang khu vực quản lý lớp tương ứng.</p>
        </div>
      </section>

      {/* Các chỉ số chính giáo viên thường xem đầu tiên. */}
      <div className="stats-grid teacher-dashboard__stats">
        {DASHBOARD_CARDS.map((card) => (
          <article key={card.label} className={`stat-card teacher-dashboard__stat-card teacher-dashboard__stat-card--${card.tone}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-body">
              <p className="stat-label">{card.label}</p>
              <h3 className="stat-value">{dashboardSummary[card.valueKey]}</h3>
            </div>
          </article>
        ))}
      </div>

      {/* Grid truy cập nhanh đến từng lớp học đã được gán cho giáo viên. */}
      <section className="section-card teacher-dashboard__classes-card">
        <div className="teacher-dashboard__section-head">
          <div>
            <p className="teacher-dashboard__section-kicker">Quick access</p>
            <h3 className="section-title">Lớp học của tôi</h3>
          </div>
          <span className="badge badge-blue">{classes.length} lớp</span>
        </div>

        {classes.length === 0 ? (
          <div className="empty-state"><p>Bạn chưa được phân công lớp nào</p></div>
        ) : (
          <div className="teacher-dashboard__class-grid">
            {classes.map((classroom) => (
              <Link key={classroom.id} to="/teacher/classes" className="teacher-dashboard__class-link">
                <article className="teacher-dashboard__class-card">
                  <p className="teacher-dashboard__class-name">{classroom.name}</p>
                  <p className="teacher-dashboard__class-meta">
                    {classroom.currentStudents || 0}/{classroom.maxStudents} học viên
                  </p>
                  <span className={`badge ${classroom.status === "active" ? "badge-green" : "badge-yellow"} teacher-dashboard__class-badge`}>
                    {classroom.status === "active" ? "Đang học" : "Chờ khai giảng"}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
