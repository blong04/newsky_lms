package com.newskyenglish.service;

import com.newskyenglish.dto.auth.AuthResponse;
import com.newskyenglish.dto.auth.EmailAvailabilityResponse;
import com.newskyenglish.dto.auth.LoginRequest;
import com.newskyenglish.dto.auth.RegisterOtpRequest;
import com.newskyenglish.dto.auth.VerifyRegisterOtpRequest;
import com.newskyenglish.dto.users.UsersDTO;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.UsersRepository;
import com.newskyenglish.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
// Xử lý luồng đăng nhập và đăng ký tài khoản cho người dùng mới.
public class AuthService {

    private final UsersRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final RegistrationEmailService registrationEmailService;
    private final RegistrationOtpService registrationOtpService;

    @Transactional(readOnly = true)
    // Xác thực tài khoản và trả về JWT kèm thông tin người dùng đăng nhập.
    public AuthResponse login(LoginRequest request) {
        Users user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Sai email hoặc mật khẩu"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Sai email hoặc mật khẩu");
        }
        if (user.getStatus() != Users.Status.active) {
            throw new BadRequestException("Tài khoản đã bị khóa");
        }
        if (user.getRoleId() == 2 && !Boolean.TRUE.equals(user.getApproved())) {
            throw new BadRequestException("Tài khoản đang chờ phê duyệt");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRoleId());
        return AuthResponse.builder()
                .token(token)
                .user(UsersDTO.Response.fromEntity(user))
                .build();
    }

    // Kiểm tra email đã được dùng trong hệ thống hay chưa để frontend báo sớm trên form.
    public EmailAvailabilityResponse checkEmailAvailability(String rawEmail) {
        String normalizedEmail = normalizeEmail(rawEmail);
        boolean available = !normalizedEmail.isBlank() && !userRepository.existsByEmail(normalizedEmail);

        return EmailAvailabilityResponse.builder()
                .available(available)
                .message(available ? "Email có thể sử dụng" : "Email đã tồn tại trong hệ thống")
                .build();
    }

    @Transactional
    // Bước 1: nhận thông tin đăng ký và gửi OTP tới email người dùng.
    public String requestRegistrationOtp(RegisterOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        validateNumericPassword(request.getPassword());
        if (normalizedEmail.isBlank()) {
            throw new BadRequestException("Email không được để trống");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("Email đã tồn tại");
        }

        RegistrationOtpService.PendingRegistration pendingRegistration = registrationOtpService.issueOtp(
                normalizedEmail,
                request.getName(),
                passwordEncoder.encode(request.getPassword())
        );
        registrationEmailService.sendRegistrationOtpEmail(
                normalizedEmail,
                request.getName(),
                pendingRegistration.getOtp()
        );

        return "OTP đã được gửi tới email của bạn. Vui lòng nhập mã để hoàn tất đăng ký.";
    }

    @Transactional
    // Bước 2: kiểm tra OTP rồi mới tạo tài khoản học viên thật trong database.
    public String verifyRegistrationOtp(VerifyRegisterOtpRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(normalizedEmail)) {
            registrationOtpService.clear(normalizedEmail);
            throw new BadRequestException("Email đã tồn tại");
        }

        RegistrationOtpService.PendingRegistration pendingRegistration = registrationOtpService
                .consumeVerifiedRegistration(normalizedEmail, request.getOtp());

        Users user = Users.builder()
                .name(pendingRegistration.getName())
                .email(normalizedEmail)
                .password(pendingRegistration.getEncodedPassword())
                .roleId(3)
                .approved(true)
                .status(Users.Status.active)
                .build();

        Users savedUser = userRepository.save(user);
        boolean mailSent = registrationEmailService.sendRegistrationSuccessEmail(savedUser);
        return mailSent
                ? "Đăng ký thành công! Hệ thống đã gửi email thông báo."
                : "Đăng ký thành công! Tài khoản đã được tạo nhưng hệ thống chưa gửi được email thông báo.";
    }

    // Đảm bảo mật khẩu đăng ký chỉ gồm đúng 4 chữ số.
    private void validateNumericPassword(String password) {
        if (password == null || !password.matches("\\d{4}")) {
            throw new BadRequestException("Mật khẩu phải gồm đúng 4 chữ số");
        }
    }

    // Đồng bộ email về lowercase + trim để tránh trùng khác hoa thường.
    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}

