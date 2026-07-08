package com.newskyenglish.service;

import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.model.Users;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
// Gửi email thông báo sau khi học viên tự tạo tài khoản thành công.
public class RegistrationEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.registration.enabled:true}")
    private boolean registrationMailEnabled;

    @Value("${app.mail.from:no-reply@newskyenglish.local}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.brand-name:NewSky English}")
    private String brandName;

    // Gửi thư chào mừng; nếu mail server chưa sẵn sàng thì chỉ log và không chặn việc đăng ký.
    public boolean sendRegistrationSuccessEmail(Users user) {
        if (!registrationMailEnabled || user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return false;
        }

        try {
            String resolvedFromAddress = resolveFromAddress();
            if (resolvedFromAddress.isBlank()) {
                return false;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(resolvedFromAddress);
            helper.setTo(user.getEmail());
            helper.setSubject("Thong bao tao tai khoan thanh cong - " + brandName);
            helper.setText(buildRegistrationSuccessHtml(user), true);
            mailSender.send(message);
            return true;
        } catch (Exception exception) {
            log.warn("Khong the gui email thong bao dang ky toi {}", user.getEmail(), exception);
            return false;
        }
    }

    // Gửi OTP xác minh email; bước này bắt buộc thành công thì mới cho phép tiếp tục đăng ký.
    public void sendRegistrationOtpEmail(String email, String displayName, String otp) {
        if (!registrationMailEnabled) {
            throw new BadRequestException("Chức năng xác minh email hiện đang tắt");
        }

        try {
            String resolvedFromAddress = resolveFromAddress();
            if (resolvedFromAddress.isBlank()) {
                throw new BadRequestException("Hệ thống chưa cấu hình email gửi OTP");
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(resolvedFromAddress);
            helper.setTo(email);
            helper.setSubject("Ma OTP xac minh dang ky - " + brandName);
            helper.setText(buildRegistrationOtpHtml(displayName, otp), true);
            mailSender.send(message);
        } catch (BadRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            log.warn("Khong the gui OTP dang ky toi {}", email, exception);
            throw new BadRequestException("Không thể gửi OTP tới email này. Vui lòng kiểm tra lại email hoặc cấu hình SMTP.");
        }
    }

    // Nội dung email ngắn gọn để học viên biết tài khoản đã được tạo thành công.
    private String buildRegistrationSuccessHtml(Users user) {
        String displayName = user.getName() != null && !user.getName().isBlank() ? user.getName() : "ban";

        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
                  <h2 style="color:#ef4444;margin-bottom:12px">Chao mung ban den voi NewSky English</h2>
                  <p>Xin chao <strong>%s</strong>,</p>
                  <p>Tai khoan hoc vien cua ban da duoc tao thanh cong tren he thong NewSky English.</p>
                  <p>Ban co the dang nhap bang email nay de bat dau xem khoa hoc, lop hoc va bai tap duoc giao.</p>
                  <p style="margin-top:20px">Tran trong,<br/>%s</p>
                </div>
                """.formatted(escapeHtml(displayName), escapeHtml(brandName));
    }

    // Email OTP ngắn gọn để người dùng lấy mã xác minh trong bước đăng ký.
    private String buildRegistrationOtpHtml(String displayName, String otp) {
        String safeName = displayName != null && !displayName.isBlank() ? displayName : "ban";

        return """
                <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
                  <h2 style="color:#ef4444;margin-bottom:12px">Xac minh email dang ky</h2>
                  <p>Xin chao <strong>%s</strong>,</p>
                  <p>Ma OTP de hoan tat dang ky tai khoan hoc vien tren %s la:</p>
                  <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#b91c1c;margin:20px 0">%s</div>
                  <p>Ma co hieu luc trong vai phut. Neu ban khong yeu cau dang ky, ban co the bo qua email nay.</p>
                </div>
                """.formatted(escapeHtml(safeName), escapeHtml(brandName), escapeHtml(otp));
    }

    // Escape các ký tự cơ bản để tránh làm vỡ HTML trong email.
    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    // Ưu tiên app.mail.from, nếu trống thì dùng luôn username SMTP.
    private String resolveFromAddress() {
        if (fromAddress != null && !fromAddress.isBlank()) {
            return fromAddress.trim();
        }
        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername.trim();
        }
        return "";
    }
}
