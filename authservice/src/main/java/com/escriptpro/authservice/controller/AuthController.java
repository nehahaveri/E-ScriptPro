package com.escriptpro.authservice.controller;

import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.service.DoctorService;
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
    public AuthResponseDTO signup(@RequestBody SignupRequestDTO signupRequestDTO) {
        return doctorService.registerDoctor(signupRequestDTO);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@RequestBody LoginRequestDTO loginRequestDTO) {
        return doctorService.login(loginRequestDTO);
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponseDTO forgotPassword(
            @RequestBody ForgotPasswordRequestDTO forgotPasswordRequestDTO) {
        return doctorService.forgotPassword(forgotPasswordRequestDTO);
    }

    @PostMapping("/reset-password")
    public AuthResponseDTO resetPassword(@RequestBody ResetPasswordRequestDTO resetPasswordRequestDTO) {
        return doctorService.resetPassword(resetPasswordRequestDTO);
    }
}
