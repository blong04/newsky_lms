import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { classService } from "../../services/classService";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import { scheduleService } from "../../services/scheduleService";
import {
  CLASS_STATUS_BADGES,
  CLASS_STATUS_LABELS,
  SCHEDULE_STATUS_BADGES,
  SCHEDULE_STATUS_LABELS,
} from "../../constants/classes";
import { getClassLifecycle, getScheduleLifecycle } from "../../utils/schedule";
import "./Schedule.css";

export default function StudentSchedule() {
  const { user } = useAuth();

  // State dữ liệu lớp, lịch học và khóa học để render hai khu vực cùng lúc.
  const [enrollments, setEnrollments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchAll = async () => {
      setLoading(true);

      try {
        const [enrollmentData, classData, courseData] = await Promise.all([
          enrollmentService.getStudentEnrollments(),
          classService.getPublicClasses(),
          courseService.getAll(),
        ]);

        const myEnrollments = (enrollmentData || []).filter((item) => ["approved", "completed"].includes(item.status));
        const allClasses = classData || [];
        const allCourses = courseData || [];

        setEnrollments(myEnrollments);
        setClasses(allClasses);
        setCourses(allCourses);

        const myClassIds = [...new Set(myEnrollments.map((item) => item.classId).filter(Boolean))];
        const scheduleResponses = await Promise.all(
          myClassIds.map((classId) =>
            scheduleService.getByClass(classId)
              .then((response) => (response || []).map((schedule) => ({ ...schedule, classId })))
              .catch(() => [])
          )
        );

        setSchedules(scheduleResponses.flat());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const getClass = (id) => classes.find((item) => Number(item.id) === Number(id));
  const getCourse = (id) => courses.find((item) => Number(item.id) === Number(id));

  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const filteredSchedules = useMemo(() => (
    schedules
      .filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        if (filter === "week") {
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        }
        if (filter === "month") {
          return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
        }
        return true;
      })
      .sort((left, right) => new Date(left.date) - new Date(right.date))
  ), [schedules, filter]);

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in student-schedule">
      <div className="page-header">
        <h1>Lớp & Lịch học</h1>
        <p>Thông tin các lớp và lịch học của bạn</p>
      </div>

      {/* Thẻ lớp học hiện tại của student. */}
      <section className="section-card student-schedule__classes-card">
        <h3 className="section-title">🏫 Lớp đang tham gia ({enrollments.length})</h3>
        {enrollments.length === 0 ? (
          <div className="empty-state"><p>Bạn chưa tham gia lớp học nào</p></div>
        ) : (
          <div className="student-schedule__class-grid">
            {enrollments.map((enrollment) => {
              const classroom = getClass(enrollment.classId);
              const course = getCourse(enrollment.courseId);
              if (!classroom && !enrollment.className) {
                return null;
              }

              const className = classroom?.name || enrollment.className || `Lớp #${enrollment.classId}`;
              const courseName = course?.title || enrollment.courseName || `Khóa #${enrollment.courseId}`;
              const examType = course?.examType || enrollment.examType || "";
              const startDate = classroom?.startDate || enrollment.startDate;
              const endDate = classroom?.endDate || enrollment.endDate;
              const classStatus = getClassLifecycle(startDate, endDate);

              return (
                <article key={enrollment.id} className="student-schedule__class-card">
                  <div className="student-schedule__class-header">
                    {examType && <span className="student-schedule__class-chip">{examType}</span>}
                    <p className="student-schedule__class-name">{className}</p>
                    <p className="student-schedule__class-course">{courseName}</p>
                  </div>
                  <div className="student-schedule__class-body">
                    {(startDate || endDate) && (
                      <p className="student-schedule__class-dates">
                        📅 {startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "—"} → {endDate ? new Date(endDate).toLocaleDateString("vi-VN") : "—"}
                      </p>
                    )}
                    <span className={`badge ${CLASS_STATUS_BADGES[classStatus] || "badge-gray"}`}>
                      {CLASS_STATUS_LABELS[classStatus] || classStatus}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Lịch học chi tiết theo tuần, tháng hoặc toàn bộ. */}
      <section className="section-card">
        <div className="student-schedule__section-head">
          <h3 className="section-title student-schedule__section-title">📅 Lịch học</h3>
          <div className="filter-tabs student-schedule__filter-tabs">
            {[["week", "Tuần này"], ["month", "Tháng này"], ["all", "Tất cả"]].map(([key, label]) => (
              <button key={key} className={`filter-tab-btn ${filter === key ? "active" : ""}`} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="empty-state"><p>Không có lịch học nào</p></div>
        ) : (
          filteredSchedules.map((schedule) => {
            const classroom = getClass(schedule.classId);
            const course = getCourse(classroom?.courseId);

            const title = schedule.title || "";
            const dateValue = schedule.date || null;
            const startTime = schedule.startTime || "";
            const endTime = schedule.endTime || "";
            const location = schedule.location || "Tại trung tâm";
            const status = getScheduleLifecycle(dateValue, startTime, endTime);
            const date = dateValue ? new Date(dateValue) : null;
            const isToday = date?.toDateString() === now.toDateString();

            return (
              <article key={schedule.id} className={`student-schedule__schedule-item ${isToday ? "student-schedule__schedule-item--today" : ""}`}>
                <div className="student-schedule__date-box">
                  <span className="student-schedule__date-day">{date ? date.getDate() : "—"}</span>
                  <span className="student-schedule__date-month">{date ? date.toLocaleDateString("vi-VN", { month: "short" }) : ""}</span>
                  {isToday && <span className="student-schedule__today-dot" />}
                </div>
                <div className="student-schedule__schedule-content">
                  <div className="student-schedule__schedule-head">
                    <div>
                      <p className="student-schedule__schedule-title">{title}</p>
                      <p className="student-schedule__schedule-subtitle">{classroom?.name || schedule.className || ""}{course ? ` · ${course.title}` : ""}</p>
                    </div>
                    <span className={`badge ${SCHEDULE_STATUS_BADGES[status] || "badge-gray"}`}>{SCHEDULE_STATUS_LABELS[status] || status}</span>
                  </div>
                  <div className="student-schedule__schedule-meta">
                    <span>⏰ {startTime?.toString().slice(0, 5)} – {endTime?.toString().slice(0, 5)}</span>
                  </div>
                  <div className="student-schedule__schedule-meta">
                    <span>📍 {location}</span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
