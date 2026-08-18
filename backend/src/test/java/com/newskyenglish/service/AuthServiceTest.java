package com.newskyenglish.service;

import com.newskyenglish.dto.auth.AuthResponse;
import com.newskyenglish.dto.auth.LoginRequest;
import com.newskyenglish.exception.BadRequestException;
import com.newskyenglish.model.Users;
import com.newskyenglish.repository.UsersRepository;
import com.newskyenglish.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsersRepository userRepository;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RegistrationEmailService registrationEmailService;
    @Mock
    private RegistrationOtpService registrationOtpService;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private Users activeStudent;

    @BeforeEach
    void setUp() {
        loginRequest = new LoginRequest();
        loginRequest.setEmail("abc@gmail.com");
        loginRequest.setPassword("123456");

        activeStudent = Users.builder()
                .id(1L)
                .name("Student A")
                .email("abc@gmail.com")
                .password("encoded-password")
                .roleId(3)
                .approved(true)
                .status(Users.Status.active)
                .build();
    }

    @Test
    void login_withCorrectCredentials_returnsTokenAndUser() {
        when(userRepository.findByEmail("abc@gmail.com")).thenReturn(Optional.of(activeStudent));
        when(passwordEncoder.matches("123456", "encoded-password")).thenReturn(true);
        when(jwtUtil.generateToken(1L, "abc@gmail.com", 3)).thenReturn("fake-jwt-token");

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("abc@gmail.com");
    }

    @Test
    void login_withWrongPassword_throwsBadRequestException() {
        when(userRepository.findByEmail("abc@gmail.com")).thenReturn(Optional.of(activeStudent));
        when(passwordEncoder.matches("123456", "encoded-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Sai email hoặc mật khẩu");
    }

    @Test
    void login_withUnknownEmail_throwsBadRequestException() {
        when(userRepository.findByEmail("abc@gmail.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Sai email hoặc mật khẩu");
    }

    @Test
    void login_withInactiveAccount_throwsBadRequestException() {
        activeStudent.setStatus(Users.Status.suspended);
        when(userRepository.findByEmail("abc@gmail.com")).thenReturn(Optional.of(activeStudent));
        when(passwordEncoder.matches("123456", "encoded-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Tài khoản đã bị khóa");
    }

}
