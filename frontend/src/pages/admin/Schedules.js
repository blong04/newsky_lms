import React, { useEffect, useMemo, useState } from "react";
import { classService } from "../../services/classService";
import { scheduleService } from "../../services/scheduleService";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import toast from "react-hot-toast";
import "./Schedules.css";

const INITIAL_FORM = {
  classId: "",
  title: "",
  description: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
};

const STATUS_META = {
  scheduled: { label: "Sắp diễn ra", badge: "badge-blue" },
  ongoing: { label: "Đang diễn ra", badge: "badge-green" },
  completed: { label: "Đã học xong", badge: "badge-gray" },
};

export default function AdminSchedules() {
  const [classes, setClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [classData, scheduleData] = await Promise.all([
        classService.getAdminClasses().catch(() => []),
        scheduleService.getAll().catch(() => []),
      ]);
      setClasses(classData || []);
      setSchedules(scheduleData || []);
    } catch {
      toast.error("Không thể tải dữ liệu lịch học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getClassName = (classId) => classes.find((item) => Number(item.id) === Number(classId))?.name || `Lớp #${classId}`;

  const visibleSchedules = useMemo(() => {
    const filtered = classFilter
      ? schedules.filter((item) => Number(item.classId) === Number(classFilter))
      : schedules;
    return [...filtered].sort((first, second) => {
      const dateCompare = String(first.date || "").localeCompare(String(second.date || ""));
      if (dateCompare !== 0) return dateCompare;
      return String(first.startTime || "").localeCompare(String(second.startTime || ""));
    });
  }, [schedules, classFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleSchedules.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedSchedules = visibleSchedules.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...INITIAL_FORM, classId: classFilter || "" });
    setShowModal(true);
  };

  const openEditModal = (schedule) => {
    setEditingId(schedule.id);
    setForm({
      classId: schedule.classId || "",
      title: schedule.title || "",
      description: schedule.description || "",
      date: schedule.date || "",
      startTime: (schedule.startTime || "").slice(0, 5),
      endTime: (schedule.endTime || "").slice(0, 5),
      location: schedule.location || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSave = async () => {
    if (!form.classId || !form.title || !form.date || !form.startTime || !form.endTime) {
      toast.error("Nhập đầy đủ lớp, tiêu đề, ngày và giờ học");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        classId: Number(form.classId),
        title: form.title,
        description: form.description,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
      };

      if (editingId) {
        await scheduleService.update(editingId, payload);
        toast.success("Đã cập nhật lịch học");
      } else {
        await scheduleService.create(payload);
        toast.success("Đã thêm lịch học");
      }

      closeModal();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lưu lịch học");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule) => {
    if (!window.confirm(`Xóa buổi học "${schedule.title}"?`)) {
      return;
    }
    try {
      await scheduleService.delete(schedule.id);
      toast.success("Đã xóa lịch học");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa lịch học");
    }
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="admin-page fade-in admin-schedules">
      <div className="page-header">
        <div>
          <h1>Lịch học</h1>
          <p className="admin-schedules__subtitle">Tạo, sửa và xóa từng buổi học theo lớp.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Thêm lịch học</button>
      </div>

      <div className="admin-schedules__filter">
        <select className="filter-select" value={classFilter} onChange={(event) => { setClassFilter(event.target.value); setPage(1); }}>
          <option value="">Tất cả lớp</option>
          {classes.map((classroom) => (
            <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lớp</th>
              <th>Tiêu đề</th>
              <th>Ngày</th>
              <th>Giờ học</th>
              <th>Địa điểm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSchedules.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-state"><p>Chưa có lịch học nào</p></td>
              </tr>
            ) : (
              paginatedSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>{getClassName(schedule.classId)}</td>
                  <td>
                    <p className="admin-schedules__title">{schedule.title}</p>
                    {schedule.description && <p className="admin-schedules__muted">{schedule.description}</p>}
                  </td>
                  <td>{schedule.date ? new Date(schedule.date).toLocaleDateString("vi-VN") : "—"}</td>
                  <td>{(schedule.startTime || "").slice(0, 5)} - {(schedule.endTime || "").slice(0, 5)}</td>
                  <td>{schedule.location || "—"}</td>
                  <td>
                    <span className={`badge ${STATUS_META[schedule.status]?.badge || "badge-gray"}`}>
                      {STATUS_META[schedule.status]?.label || schedule.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-schedules__actions">
                      <button className="btn btn-warning btn-sm" title="Sửa" onClick={() => openEditModal(schedule)}>✏️</button>
                      <button className="btn btn-danger btn-sm" title="Xóa" onClick={() => handleDelete(schedule)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination admin-schedules__pagination">
          <span className="pagination-info">Trang {page}/{totalPages} — {visibleSchedules.length} buổi học</span>
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

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? "Sửa lịch học" : "Thêm lịch học"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Lớp học</label>
                <select
                  className="filter-select"
                  value={form.classId}
                  onChange={(event) => setForm({ ...form, classId: event.target.value })}
                >
                  <option value="">— Chọn lớp —</option>
                  {classes.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>{classroom.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tiêu đề buổi học</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="VD: Buổi 5 - Ôn tập Reading Passage 2"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Nội dung chi tiết buổi học (không bắt buộc)"
                />
              </div>
              <div className="admin-schedules__form-row">
                <div className="form-group">
                  <label>Ngày học</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giờ kết thúc</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Địa điểm</label>
                <input
                  value={form.location}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                  placeholder="VD: Phòng 302 hoặc link học online"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                {saving ? "Đang lưu..." : "Lưu lịch học"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
