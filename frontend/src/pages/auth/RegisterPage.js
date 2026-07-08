import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";
import "./Auth.css";
import "./RegisterPage.css";

export default function RegisterPage() {
  // State form đăng ký tài khoản mới.
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [otp, setOtp] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [emailState, setEmailState] = useState({ status: "idle", message: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const normalizeEmail = (value) => value.trim().toLowerCase();
  const hasValidEmailFormat = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // Kiểm tra email đã được dùng trong hệ thống chưa để báo sớm cho người dùng.
  const checkEmailAvailability = async (rawEmail) => {
    const normalizedEmail = normalizeEmail(rawEmail);
    if (!normalizedEmail) {
      setEmailState({ status: "idle", message: "" });
      return false;
    }
    if (!hasValidEmailFormat(normalizedEmail)) {
      setEmailState({ status: "error", message: "Email chưa đúng định dạng." });
      return false;
    }

    setEmailState({ status: "checking", message: "Đang kiểm tra email..." });
    try {
      const response = await authService.checkEmailAvailability(normalizedEmail);
      setEmailState({
        status: response.available ? "success" : "error",
        message: response.message,
      });
      return response.available;
    } catch (error) {
      setEmailState({ status: "error", message: "Không thể kiểm tra email lúc này." });
      return false;
    }
  };

  // Bước 1: xác thực cơ bản rồi yêu cầu backend gửi OTP tới email người dùng.
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(form.email);

    if (form.password !== form.confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    if (!/^\d{4}$/.test(form.password)) { toast.error("Mật khẩu phải gồm đúng 4 chữ số"); return; }
    if (!form.name.trim()) { toast.error("Vui lòng nhập họ và tên"); return; }
    if (!hasValidEmailFormat(normalizedEmail)) { toast.error("Email chưa đúng định dạng"); return; }

    const emailAvailable = await checkEmailAvailability(normalizedEmail);
    if (!emailAvailable) {
      toast.error("Email này chưa thể dùng để đăng ký");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.requestRegisterOtp({
        name: form.name.trim(),
        email: normalizedEmail,
        password: form.password,
      });
      toast.success(res.message);
      setOtpRequested(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: người dùng nhập OTP đúng thì backend mới tạo tài khoản thật.
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(form.email);
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP phải gồm đúng 6 chữ số");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyRegisterOtp({
        email: normalizedEmail,
        otp,
      });
      toast.success(res.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xác minh OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="brand-icon">🎓</span>
          <div><h1>NewSky English</h1><p>Nền tảng học tiếng Anh trực tuyến</p></div>
        </div>
        <div className="auth-hero">
          <h2>Bắt đầu hành trình</h2>
          <p>Tạo tài khoản và tham gia cộng đồng học tiếng Anh với lộ trình IELTS, TOEIC chuyên nghiệp.</p>
          <div className="feature-list">
            <div className="feature-item">✅ Lộ trình học IELTS & TOEIC chuẩn quốc tế</div>
            <div className="feature-item">✅ Giáo viên kinh nghiệm, chứng chỉ cao</div>
            <div className="feature-item">✅ Lịch học linh hoạt, online & offline</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Điền thông tin để tạo tài khoản mới</p>
          </div>

          {/* Form đăng ký công khai chỉ tạo tài khoản học viên và dùng OTP xác minh email. */}
          <form onSubmit={otpRequested ? handleVerifyOtp : handleRequestOtp} className="auth-form">
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={otpRequested}
                required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="example@email.com"
                value={form.email}
                onChange={e => {
                  setForm({ ...form, email: e.target.value });
                  setEmailState({ status: "idle", message: "" });
                  setOtpRequested(false);
                  setOtp("");
                }}
                onBlur={() => checkEmailAvailability(form.email)}
                disabled={otpRequested}
                required />
              {emailState.message && (
                <p className={`note-text ${emailState.status === "success" ? "note-text--success" : emailState.status === "checking" ? "note-text--muted" : "note-text--error"}`}>
                  {emailState.message}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" placeholder="Gồm đúng 4 chữ số"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                disabled={otpRequested}
                required />
              <p className="note-text">Mật khẩu phải gồm đúng 4 chữ số.</p>
            </div>
            <div className="form-group">
              <label>Xác nhận mật khẩu</label>
              <input type="password" placeholder="Nhập lại mật khẩu"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                disabled={otpRequested}
                required />
            </div>
            <div className="form-group">
              <label>Loại tài khoản</label>
              <div className="role-selector">
                <button type="button" className="role-btn active">
                  👨‍🎓 Học viên
                </button>
              </div>
              <p className="note-text">Tài khoản giáo viên sẽ do admin tạo trực tiếp trong hệ thống.</p>
              <p className="note-text note-text--muted">Đăng ký dùng OTP qua email, nên chỉ email nhận được mã mới tạo tài khoản thành công.</p>
            </div>

            {otpRequested && (
              <div className="form-group">
                <label>Mã OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Nhập 6 chữ số được gửi qua email"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
                <p className="note-text note-text--muted">Nếu chưa nhận được email, bạn có thể sửa email rồi gửi lại OTP.</p>
              </div>
            )}

            <button type="submit" className="btn-primary-full" disabled={loading || emailState.status === "checking"}>
              {loading ? <span className="spinner" /> : otpRequested ? "Xác nhận OTP" : "Gửi OTP"}
            </button>
            {otpRequested && (
              <button
                type="button"
                className="btn-primary-full register-page__secondary-btn"
                disabled={loading}
                onClick={handleRequestOtp}
              >
                Gửi lại OTP
              </button>
            )}
          </form>

          <p className="auth-footer-text">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
