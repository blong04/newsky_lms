package com.newskyenglish.config;

import com.newskyenglish.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
// Khai báo các luật bảo mật chính: route public, route theo role và JWT filter.
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    // Cấu hình Spring Security theo kiểu stateless vì hệ thống dùng JWT.
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s ->
                s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/classes", "/courses/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/teacher/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/student/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.POST, "/student/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers(HttpMethod.PUT, "/student/**").hasAnyRole("ADMIN", "STUDENT")

                .requestMatchers(HttpMethod.GET, "/users").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/users/*").authenticated()
                .requestMatchers(HttpMethod.PUT, "/users/*/change-password").authenticated()
                .requestMatchers(HttpMethod.PUT, "/users/*").authenticated()

                .requestMatchers(HttpMethod.GET, "/enrollments", "/enrollments/class/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/enrollments/*/cancel").authenticated()
                .requestMatchers(HttpMethod.PUT, "/enrollments/*").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET, "/assignments/*/submissions").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.GET, "/assignments/submit/user/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/assignments/*/submit").authenticated()
                .requestMatchers(HttpMethod.POST, "/assignments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/teacher/assignments").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/assignments/submissions/*/grade").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/assignments/*").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/assignments/*").hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.GET, "/quizzes/*/submissions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/quizzes/submissions/user/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/quizzes/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/quizzes/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.PUT, "/notifications/*/read", "/notifications/read-all").authenticated()
                .requestMatchers(HttpMethod.POST, "/notifications/send").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/tests", "/tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/tests", "/tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/tests", "/tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/tests/*/submissions").hasRole("ADMIN")

                .requestMatchers(HttpMethod.POST, "/schedules", "/schedules/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/schedules", "/schedules/**").hasRole("ADMIN")

                .requestMatchers(HttpMethod.GET,
                    "/quizzes",
                    "/quizzes/class/*",
                    "/quizzes/type/*",
                    "/quizzes/*/full",
                    "/assignments",
                    "/assignments/*",
                    "/assignments/class/*",
                    "/notifications/my",
                    "/schedules/**",
                    "/tests",
                    "/tests/*",
                    "/tests/class/*"
                ).authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    // Mã hóa mật khẩu bằng BCrypt trước khi lưu vào database.
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
