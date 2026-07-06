import React, { useEffect, useMemo, useState } from "react";
import { userService } from "../../services/userService";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import { ROLE_BADGES, ROLE_NAMES } from "../../constants/roles";
import toast from "react-hot-toast";
import "./Users.css";

export default function AdminUsers() {
  // State dữ liệu chính cho bảng người dùng và danh sách giáo viên chờ duyệt.
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // State điều khiển bộ lọc và điều hướng danh sách.
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // State modal thêm mới người dùng.
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", roleId: 3 });

  // Load users và teacher pending song song để dashboard admin phản hồi nhanh.
  const fetchData = async () => {
    setLoading(true);
    try {
      const [userResponse, pendingResponse] = await Promise.all([
        userService.getAll(),
        userService.getPendingTeachers(),
      ]);
      setUsers(userResponse || []);
      setPending(pendingResponse || []);
    } catch {
      toast.error("Không thể tải dữ liệu người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Tập dữ liệu sau khi áp dụng tìm kiếm và bộ lọc trạng thái.
  const filteredUsers = useMemo(() => (
    users.filter((user) =>
      (!search
        || user.name?.toLowerCase().includes(search.toLowerCase())
        || user.email?.toLowerCase().includes(search.toLowerCase()))
      && (!roleFilter || user.roleId === Number(roleFilter))
      && (!statusFilter || user.status === statusFilter)
    )
  ), [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / DEFAULT_TABLE_PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((page - 1) * DEFAULT_TABLE_PAGE_SIZE, page * DEFAULT_TABLE_PAGE_SIZE);

  // Chuyển đổi trạng thái hiển thị sang badge dễ đọc.
  const getStatusBadge = (user) => {
    if (user.roleId === 2 && !user.approved) {
      return <span className="badge badge-yellow">Chờ duyệt</span>;
    }

    if (user.status === "active") {
      return <span className="badge badge-green">Hoạt động</span>;
    }

    if (user.status === "suspended") {
      return <span className="badge badge-red">Bị khóa</span>;
    }

    return <span className="badge badge-gray">Không HĐ</span>;
  };

  const handleApprove = async (id) => {
    try {
      await userService.approveTeacher(id);
      toast.success("Đã phê duyệt tài khoản");
      fetchData();
    } catch {
      toast.error("Phê duyệt thất bại");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Từ chối và xóa tài khoản giáo viên này?")) {
      return;
    }

    try {
      await userService.rejectTeacher(id);
      toast.success("Đã từ chối tài khoản");
      fetchData();
    } catch {
      toast.error("Từ chối thất bại");
    }
  };

  const handleToggleLock = async (user) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";

    if (!window.confirm(nextStatus === "suspended" ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?")) {
      return;
    }

    try {
      await userService.update(user.id, { status: nextStatus });
      toast.success(nextStatus === "suspended" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      fetchData();
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa vĩnh viễn người dùng này?")) {
      return;
    }

    try {
      await userService.delete(id);
      toast.success("Đã xóa người dùng");
      fetchData();
    } catch {
      toast.error("Xóa người dùng thất bại");
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Vui lòng nhập họ tên và email");
      return;
    }
    if (form.password && !/^\d{4}$/.test(form.password)) {
      toast.error("Mật khẩu phải gồm đúng 4 chữ số");
      return;
    }

    try {
      await userService.create({ ...form, roleId: Number(form.roleId) });
      toast.success("Thêm người dùng thành công");
      setModal(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Thêm người dùng thất bại");
    }
  };

  const resetAndOpenCreateModal = () => {
    setForm({ name: "", email: "", password: "", roleId: 3 });
    setModal("add");
  };

  return (
    <div className="admin-page fade-in admin-users">
      <section className="admin-users__hero">
        <div>
          <p className="admin-users__eyebrow">User management</p>
          <h1>Quản lý người dùng</h1>
          <p className="admin-users__subtitle">
            Theo dõi tài khoản đang hoạt động, xử lý giáo viên chờ duyệt và kiểm soát phân quyền tập trung.
          </p>
        </div>
        <div className="admin-users__metrics">
          <article className="admin-users__metric-card">
            <span>Tổng tài khoản</span>
            <strong>{users.length}</strong>
          </article>
          <article className="admin-users__metric-card admin-users__metric-card--pending">
            <span>Chờ phê duyệt</span>
            <strong>{pending.length}</strong>
          </article>
        </div>
      </section>

      {/* Khối ưu tiên cho giáo viên đang chờ admin xét duyệt. */}
      {pending.length > 0 && (
        <section className="section-card admin-users__pending-card">
          <div className="admin-users__section-head">
            <div>
              <p className="admin-users__section-kicker">Ưu tiên xử lý</p>
              <h3 className="section-title">Giáo viên chờ phê duyệt</h3>
            </div>
            <span className="badge badge-yellow">{pending.length} hồ sơ</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="admin-users__identity">
                      <div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="admin-users__muted">{user.email}</td>
                  <td className="admin-users__muted admin-users__tiny">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td>
                    <div className="admin-users__actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleApprove(user.id)}
                        title="Phê duyệt"
                      >
                        ✅
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleReject(user.id)}
                        title="Từ chối"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Thanh lọc giúp admin thu hẹp dữ liệu trước khi thao tác. */}
      <div className="toolbar admin-users__toolbar">
        <div className="toolbar-left">
          <input
            className="search-input"
            placeholder="🔍 Tìm theo tên hoặc email"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <select
            className="filter-select"
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả vai trò</option>
            <option value="1">Admin</option>
            <option value="2">Giáo viên</option>
            <option value="3">Học viên</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="suspended">Bị khóa</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={resetAndOpenCreateModal}>+ Thêm người dùng</button>
      </div>

      {/* Bảng dữ liệu chính cho thao tác quản lý tài khoản. */}
      <div className="table-wrapper">
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state"><p>Không có dữ liệu phù hợp</p></td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-users__identity">
                          <div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <p className="admin-users__name">{user.name}</p>
                            <p className="admin-users__tiny admin-users__muted">ID #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="admin-users__muted">{user.email}</td>
                      <td><span className={`badge ${ROLE_BADGES[user.roleId]}`}>{ROLE_NAMES[user.roleId]}</span></td>
                      <td>{getStatusBadge(user)}</td>
                      <td className="admin-users__muted admin-users__tiny">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td>
                        <div className="admin-users__actions">
                          <button
                            className={`btn btn-sm ${user.status === "suspended" ? "btn-success" : "btn-warning"}`}
                            onClick={() => handleToggleLock(user)}
                            title={user.status === "suspended" ? "Mở khóa" : "Khóa tài khoản"}
                          >
                            {user.status === "suspended" ? "🔓" : "🔒"}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)} title="Xóa">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {filteredUsers.length > DEFAULT_TABLE_PAGE_SIZE && (
              <div className="pagination">
                <span className="pagination-info">
                  Hiển thị {((page - 1) * DEFAULT_TABLE_PAGE_SIZE) + 1}–{Math.min(page * DEFAULT_TABLE_PAGE_SIZE, filteredUsers.length)} / {filteredUsers.length}
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

      {/* Modal thêm user mới để admin chủ động tạo tài khoản nội bộ. */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3>Thêm người dùng</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Họ tên</label>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div className="form-group">
                <label>Mật khẩu</label>
                <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                <p className="admin-users__tiny admin-users__muted">Để trống để backend dùng mật khẩu mặc định 1234, hoặc nhập đúng 4 chữ số.</p>
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <select value={form.roleId} onChange={(event) => setForm({ ...form, roleId: Number(event.target.value) })}>
                  <option value={1}>Admin</option>
                  <option value={2}>Giáo viên</option>
                  <option value={3}>Học viên</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Hủy</button>
              <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
