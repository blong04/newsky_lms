package com.newskyenglish.service;

import com.newskyenglish.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
// Quản lý OTP đăng ký trong bộ nhớ để xác minh email trước khi tạo tài khoản.
public class RegistrationOtpService {

    private final Map<String, PendingRegistration> pendingRegistrations = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.registration.otp.expire-minutes:5}")
    private long otpExpireMinutes;

    @Value("${app.registration.otp.resend-seconds:60}")
    private long otpResendSeconds;

    // Tạo hoặc ghi đè OTP chờ xác minh cho email đăng ký hiện tại.
    public PendingRegistration issueOtp(String email, String name, String encodedPassword) {
        cleanupExpired();
        String normalizedEmail = normalizeEmail(email);
        PendingRegistration current = pendingRegistrations.get(normalizedEmail);
        LocalDateTime now = LocalDateTime.now();

        if (current != null && current.getResendAvailableAt() != null && now.isBefore(current.getResendAvailableAt())) {
            throw new BadRequestException("Vui lòng chờ trước khi yêu cầu gửi lại OTP");
        }

        PendingRegistration pendingRegistration = PendingRegistration.builder()
                .email(normalizedEmail)
                .name(name)
                .encodedPassword(encodedPassword)
                .otp(generateOtp())
                .expiresAt(now.plusMinutes(otpExpireMinutes))
                .resendAvailableAt(now.plusSeconds(otpResendSeconds))
                .build();
        pendingRegistrations.put(normalizedEmail, pendingRegistration);
        return pendingRegistration;
    }

    // Xác minh OTP và trả lại thông tin đăng ký tạm để service tạo tài khoản thật.
    public PendingRegistration consumeVerifiedRegistration(String email, String otp) {
        cleanupExpired();
        String normalizedEmail = normalizeEmail(email);
        PendingRegistration pendingRegistration = pendingRegistrations.get(normalizedEmail);
        if (pendingRegistration == null) {
            throw new BadRequestException("Không tìm thấy yêu cầu OTP hoặc OTP đã hết hạn");
        }
        if (pendingRegistration.getExpiresAt() != null && LocalDateTime.now().isAfter(pendingRegistration.getExpiresAt())) {
            pendingRegistrations.remove(normalizedEmail);
            throw new BadRequestException("OTP đã hết hạn, vui lòng yêu cầu mã mới");
        }
        if (!pendingRegistration.getOtp().equals(otp)) {
            throw new BadRequestException("OTP không chính xác");
        }

        pendingRegistrations.remove(normalizedEmail);
        return pendingRegistration;
    }

    // Hủy OTP cũ khi email này vừa được tạo tài khoản thật ở DB.
    public void clear(String email) {
        pendingRegistrations.remove(normalizeEmail(email));
    }

    private void cleanupExpired() {
        LocalDateTime now = LocalDateTime.now();
        pendingRegistrations.entrySet().removeIf(entry ->
                entry.getValue().getExpiresAt() != null && now.isAfter(entry.getValue().getExpiresAt()));
    }

    private String generateOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PendingRegistration {
        private String email;
        private String name;
        private String encodedPassword;
        private String otp;
        private LocalDateTime expiresAt;
        private LocalDateTime resendAvailableAt;
    }
}
