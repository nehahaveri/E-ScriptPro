package com.escriptpro.authservice.controller;

import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.GoogleLoginRequestDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.LoginResponseDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.dto.VerifyOtpRequestDTO;
import com.escriptpro.authservice.dto.InitiateSignupRequestDTO;
import com.escriptpro.authservice.dto.InitiateSignupResponseDTO;
import com.escriptpro.authservice.dto.VerifySignupOtpRequestDTO;
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

    @PostMapping("/signup/initiate")
    public InitiateSignupResponseDTO initiateSignup(@Valid @RequestBody InitiateSignupRequestDTO initiateSignupRequestDTO) {
        return doctorService.initiateSignupDoctor(initiateSignupRequestDTO);
    }

    @PostMapping("/signup/verify-otp")
    public AuthResponseDTO verifySignupOtp(@Valid @RequestBody VerifySignupOtpRequestDTO verifySignupOtpRequestDTO) {
        return doctorService.verifySignupOtp(verifySignupOtpRequestDTO);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        return doctorService.login(loginRequestDTO);
    }

    @PostMapping("/google-login")
    public LoginResponseDTO googleLogin(@Valid @RequestBody GoogleLoginRequestDTO googleLoginRequestDTO) {
        return doctorService.googleLogin(googleLoginRequestDTO);
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
}
