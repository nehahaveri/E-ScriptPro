package com.escriptpro.authservice.controller;

import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.LoginResponseDTO;
import com.escriptpro.authservice.dto.RefreshTokenRequestDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.dto.VerifyOtpRequestDTO;
import com.escriptpro.authservice.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final DoctorService doctorService;

    public AuthController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping("/signup")
    public AuthResponseDTO signup(@Valid @RequestBody SignupRequestDTO signupRequestDTO) {
        return doctorService.registerDoctor(signupRequestDTO);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        return doctorService.login(loginRequestDTO);
    }

    @PostMapping("/verify-otp")
    public LoginResponseDTO verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO verifyOtpRequestDTO) {
        return doctorService.verifyOtp(verifyOtpRequestDTO);
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponseDTO forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO forgotPasswordRequestDTO) {
        return doctorService.forgotPassword(forgotPasswordRequestDTO);
    }

    @PostMapping("/reset-password")
    public AuthResponseDTO resetPassword(@Valid @RequestBody ResetPasswordRequestDTO resetPasswordRequestDTO) {
        return doctorService.resetPassword(resetPasswordRequestDTO);
    }

    @PostMapping("/refresh")
    public AuthResponseDTO refresh(@Valid @RequestBody RefreshTokenRequestDTO refreshTokenRequestDTO) {
        return doctorService.refreshToken(refreshTokenRequestDTO.getRefreshToken());
    }
}
