import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../services/enrollmentService";
import { dashboardService } from "../../services/dashboardService";
import { useAuth } from "../../contexts/AuthContext";
import "./Dashboard.css";

export default function StudentDashboard() {
  const { user } = useAuth();

  // State dữ liệu khóa học sinh viên đã đăng ký.
  const [enrollments, setEnrollments] = useState([]);
  const [summary, setSummary] = useState({
    activeEnrollmentCount: 0,
    completedEnrollmentCount: 0,
    pendingEnrollmentCount: 0,
    quizSubmissionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      enrollmentService.getStudentEnrollments().catch(() => []),
      dashboardService.getStudentDashboard().catch(() => null),
    ])
      .then(([enrollmentResponse, summaryResponse]) => {
        setEnrollments(enrollmentResponse || []);
        setSummary(summaryResponse || {
          activeEnrollmentCount: 0,
          completedEnrollmentCount: 0,
          pendingEnrollmentCount: 0,
          quizSubmissionCount: 0,
        });
      })
      .catch(() => {
        setEnrollments([]);
        setSummary({
          activeEnrollmentCount: 0,
          completedEnrollmentCount: 0,
          pendingEnrollmentCount: 0,
          quizSubmissionCount: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const activeEnrollments = useMemo(() => enrollments.filter((item) => item.status === "approved"), [enrollments]);
  const pendingEnrollments = useMemo(() => enrollments.filter((item) => item.status === "pending"), [enrollments]);
  const completedEnrollments = useMemo(() => enrollments.filter((item) => item.status === "completed"), [enrollments]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-dashboard">
      <section className="student-dashboard__hero">
        <div>
          <p className="student-dashboard__eyebrow">Learning overview</p>
          <h1>Xin chào, {user?.name}</h1>
          <p className="student-dashboard__subtitle">
            Theo dõi nhanh các lớp đang học, tiến độ hiện tại và quay lại các khóa học đang hoạt động chỉ với một chạm.
          </p>
        </div>
        <div className="student-dashboard__hero-card">
          <span>Hiện tại</span>
          <strong>{summary.activeEnrollmentCount ?? activeEnrollments.length} khóa học đang diễn ra</strong>
          <p>{summary.pendingEnrollmentCount ?? pendingEnrollments.length} yêu cầu đăng ký đang chờ duyệt trong hệ thống.</p>
        </div>
      </section>

      {/* Khối chỉ số tổng quan đầu trang. */}
      <div className="stats-grid student-dashboard__stats">
        <article className="stat-card student-dashboard__stat-card student-dashboard__stat-card--active">
          <div className="stat-icon">📚</div>
          <div className="stat-body">
            <p className="stat-label">Đang học</p>
            <h3 className="stat-value">{summary.activeEnrollmentCount ?? activeEnrollments.length}</h3>
          </div>
        </article>
        <article className="stat-card student-dashboard__stat-card student-dashboard__stat-card--completed">
          <div className="stat-icon">✅</div>
          <div className="stat-body">
            <p className="stat-label">Hoàn thành</p>
            <h3 className="stat-value">{summary.completedEnrollmentCount ?? completedEnrollments.length}</h3>
          </div>
        </article>
        <article className="stat-card student-dashboard__stat-card student-dashboard__stat-card--pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-body">
            <p className="stat-label">Chờ duyệt</p>
            <h3 className="stat-value">{summary.pendingEnrollmentCount ?? pendingEnrollments.length}</h3>
          </div>
        </article>
      </div>

      {/* Danh sách khóa đang học để student quay lại nhanh. */}
      <section className="section-card student-dashboard__courses-card">
        <div className="student-dashboard__section-head">
          <h3 className="section-title student-dashboard__section-title">Khóa học đang học</h3>
          <Link to="/student/courses" className="btn btn-primary btn-sm">Xem tất cả</Link>
        </div>

        {activeEnrollments.length === 0 ? (
          <div className="empty-state">
            <p>
              Bạn chưa đăng ký khóa học nào.{" "}
              <Link to="/student/courses" className="student-dashboard__link-inline">Đăng ký ngay</Link>
            </p>
          </div>
        ) : (
          activeEnrollments.map((enrollment) => (
            <article key={enrollment.id} className="student-dashboard__course-item">
              <div>
                <p className="student-dashboard__course-name">
                  {enrollment.examType && (
                    <span className={`badge ${enrollment.examType === "IELTS" ? "badge-blue" : enrollment.examType === "TOEIC" ? "badge-green" : "badge-gray"} student-dashboard__exam-badge`}>
                      {enrollment.examType}
                    </span>
                  )}
                  {enrollment.courseName || `Khóa học #${enrollment.courseId}`}</p>
                <p className="student-dashboard__course-meta">(
                Lớp: {enrollment.className || `#${enrollment.classId}`} )  
                </p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
