import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../admin/Admin.css";
import "./Student.css";
import "./Schedule.css";

const STATUS_BADGE = {
  pending: "badge-yellow",
  active: "badge-green",
  scheduled: "badge-blue",
  ongoing: "badge-green",
  completed: "badge-gray",
  cancelled: "badge-red",
};

const STATUS_LABEL = {
  pending: "Chờ khai giảng",
  active: "Đang học",
  scheduled: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

// Tính trạng thái lớp học từ ngày bắt đầu/kết thúc thay vì phụ thuộc field DB cũ.
const getClassLifecycle = (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && now < start) {
    return "pending";
  }
  if (end && now > end) {
    return "completed";
  }
  return "active";
};

// Tính trạng thái buổi học từ ngày + giờ hiện tại để FE luôn hiển thị đúng theo thời gian thực.
const getScheduleLifecycle = (dateValue, startTimeValue, endTimeValue) => {
  if (!dateValue) {
    return "scheduled";
  }

  const baseDate = new Date(dateValue);
  const start = new Date(baseDate);
  const end = new Date(baseDate);
  const [startHour = 0, startMinute = 0] = String(startTimeValue || "00:00").split(":").map(Number);
  const [endHour = 23, endMinute = 59] = String(endTimeValue || "23:59").split(":").map(Number);
  start.setHours(startHour, startMinute, 0, 0);
  end.setHours(endHour, endMinute, 0, 0);

  const now = new Date();
  if (now < start) {
    return "scheduled";
  }
  if (now > end) {
    return "completed";
  }
  return "ongoing";
};

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
        const [enrollmentResponse, classResponse, courseResponse] = await Promise.all([
          api.get("/student/enrollments"),
          api.get("/classes"),
          api.get("/courses"),
        ]);

        const myEnrollments = (enrollmentResponse.data.data || []).filter((item) => ["approved", "enrolled"].includes(item.status));
        const allClasses = classResponse.data.data || [];
        const allCourses = courseResponse.data.data || [];

        setEnrollments(myEnrollments);
        setClasses(allClasses);
        setCourses(allCourses);

        const myClassIds = [...new Set(myEnrollments.map((item) => item.classId).filter(Boolean))];
        const scheduleResponses = await Promise.all(
          myClassIds.map((classId) =>
            api.get(`/schedules/class/${classId}`)
              .then((response) => (response.data.data || []).map((schedule) => ({ ...schedule, classId })))
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
        const scheduleDate = new Date(schedule.date || schedule.NgayHoc || schedule.ngayHoc);
        if (filter === "week") {
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        }
        if (filter === "month") {
          return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
        }
        return true;
      })
      .sort((left, right) => new Date(left.date || left.NgayHoc) - new Date(right.date || right.NgayHoc))
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
                    <span className={`badge ${STATUS_BADGE[classStatus] || "badge-gray"}`}>
                      {STATUS_LABEL[classStatus] || classStatus}
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
            const classroom = getClass(schedule.classId || schedule.ClassID);
            const course = getCourse(classroom?.courseId || classroom?.CourseID);

            const title = schedule.title || schedule.TieuDe || "";
            const dateValue = schedule.date || schedule.NgayHoc || null;
            const startTime = schedule.startTime || schedule.GioBatDau || "";
            const endTime = schedule.endTime || schedule.GioKetThuc || "";
            const location = schedule.location || schedule.DiaDiem || "Tại trung tâm";
            const status = getScheduleLifecycle(dateValue, startTime, endTime);
            const date = dateValue ? new Date(dateValue) : null;
            const isToday = date?.toDateString() === now.toDateString();

            return (
              <article key={schedule.id || schedule.ScheduleID} className={`student-schedule__schedule-item ${isToday ? "student-schedule__schedule-item--today" : ""}`}>
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
                    <span className={`badge ${STATUS_BADGE[status] || "badge-gray"}`}>{STATUS_LABEL[status] || status}</span>
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
