package com.escriptpro.authservice.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.escriptpro.authservice.config.SecurityConfig;
import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.LoginResponseDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.dto.VerifyOtpRequestDTO;
import com.escriptpro.authservice.filter.JwtFilter;
import com.escriptpro.authservice.mfa.MfaProperties;
import com.escriptpro.authservice.service.DoctorService;
import com.escriptpro.authservice.service.EmailService;
import com.escriptpro.authservice.service.OtpService;
import com.escriptpro.authservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, AuthControllerSecurityTest.TestConfig.class})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void csrfEndpointIssuesTokenCookie() throws Exception {
        mockMvc.perform(get("/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").isNotEmpty())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void signupRequiresCsrfToken() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Dr Test",
                                  "email": "doctor@example.com",
                                  "phone": "9876543210",
                                  "password": "StrongPassword12"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void signupSucceedsWithCsrfToken() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Dr Test",
                                  "email": "doctor@example.com",
                                  "phone": "9876543210",
                                  "password": "StrongPassword12"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }

    @TestConfiguration
    static class TestConfig {

        @Bean
        DoctorService doctorService() {
            return new DoctorService(
                    null,
                    null,
                    new JwtUtil("escriptpro-authservice-jwt-secret-key-for-development-only-2026-escriptpro-secure"),
                    null,
                    emailService(),
                    otpService(),
                    mfaProperties()
            ) {
                @Override
                public AuthResponseDTO registerDoctor(SignupRequestDTO signupRequestDTO) {
                    return new AuthResponseDTO("Doctor registered successfully", "jwt-token", 1L, "DOCTOR");
                }

                @Override
                public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
                    return new LoginResponseDTO("OTP sent successfully", true, "challenge-token", null, null, null);
                }

                @Override
                public LoginResponseDTO verifyOtp(VerifyOtpRequestDTO requestDTO) {
                    return new LoginResponseDTO("Login successful", false, null, "jwt-token", 1L, "DOCTOR");
                }

                @Override
                public ForgotPasswordResponseDTO forgotPassword(ForgotPasswordRequestDTO requestDTO) {
                    return new ForgotPasswordResponseDTO("If the account exists, a reset link has been sent.");
                }

                @Override
                public AuthResponseDTO resetPassword(ResetPasswordRequestDTO requestDTO) {
                    return new AuthResponseDTO("Password reset successful", null, null, null);
                }
            };
        }

        @Bean
        EmailService emailService() {
            return (email, resetToken) -> { };
        }

        @Bean
        OtpService otpService() {
            return new OtpService(null, (phone, code) -> { });
        }

        @Bean
        MfaProperties mfaProperties() {
            return new MfaProperties();
        }

        @Bean
        JwtFilter jwtFilter() {
            return new JwtFilter(new JwtUtil(
                    "escriptpro-authservice-jwt-secret-key-for-development-only-2026-escriptpro-secure"
            )) {
                @Override
                protected void doFilterInternal(
                        HttpServletRequest request,
                        HttpServletResponse response,
                        FilterChain filterChain) throws ServletException, IOException {
                    filterChain.doFilter(request, response);
                }
            };
        }
    }
}
