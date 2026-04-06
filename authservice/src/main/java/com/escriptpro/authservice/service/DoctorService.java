package com.escriptpro.authservice.service;

import com.escriptpro.authservice.client.DoctorClient;
import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.entity.AuthUser;
import com.escriptpro.authservice.repository.AuthUserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import com.escriptpro.authservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);

    private final AuthUserRepository authUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DoctorClient doctorClient;

    public DoctorService(
            AuthUserRepository authUserRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            DoctorClient doctorClient) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.doctorClient = doctorClient;
    }

    public AuthResponseDTO registerDoctor(SignupRequestDTO signupRequestDTO) {
        if (signupRequestDTO.getEmail() == null || signupRequestDTO.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (signupRequestDTO.getPassword() == null || signupRequestDTO.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        String normalizedEmail = signupRequestDTO.getEmail().trim().toLowerCase();
        String normalizedPhone = signupRequestDTO.getPhone() == null ? null : signupRequestDTO.getPhone().trim();
        String normalizedName = signupRequestDTO.getName() == null ? null : signupRequestDTO.getName().trim();

        if (authUserRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor with this email already exists");
        }

        AuthUser authUser = new AuthUser();
        authUser.setEmail(normalizedEmail);
        authUser.setPassword(passwordEncoder.encode(signupRequestDTO.getPassword()));
        authUserRepository.save(authUser);

        try {
            String serviceToken = jwtUtil.generateToken(normalizedEmail);
            doctorClient.createDoctorProfile(
                    normalizedEmail,
                    normalizedName,
                    normalizedPhone,
                    serviceToken
            );
        } catch (Exception e) {
            log.error("Doctor-service profile creation failed for email: {}. Signup will continue.",
                    normalizedEmail, e);
        }

        String token = jwtUtil.generateToken(normalizedEmail);
        return new AuthResponseDTO("Doctor registered successfully", token);
    }

    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {
        String emailOrPhone = loginRequestDTO.getEmail();
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }
        String normalizedIdentifier = emailOrPhone.trim();

        String resolvedEmail = normalizedIdentifier.contains("@")
                ? normalizedIdentifier.toLowerCase()
                : resolveEmailFromPhone(normalizedIdentifier);

        AuthUser authUser = authUserRepository.findByEmail(resolvedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), authUser.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid password");
        }

        String token = jwtUtil.generateToken(authUser.getEmail());
        return new AuthResponseDTO("Login successful", token);
    }

    public ForgotPasswordResponseDTO forgotPassword(ForgotPasswordRequestDTO requestDTO) {
        String identifier = requestDTO.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }

        String resolvedEmail = identifier.contains("@")
                ? identifier
                : resolveEmailFromPhone(identifier);

        AuthUser authUser = authUserRepository.findByEmail(resolvedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));

        String resetToken = UUID.randomUUID().toString();
        authUser.setResetToken(resetToken);
        authUser.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
        authUserRepository.save(authUser);

        return new ForgotPasswordResponseDTO(
                "Password reset token generated. Use it to reset password.",
                resetToken
        );
    }

    public AuthResponseDTO resetPassword(ResetPasswordRequestDTO requestDTO) {
        if (requestDTO.getToken() == null || requestDTO.getToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token is required");
        }
        if (requestDTO.getNewPassword() == null || requestDTO.getNewPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password is required");
        }
        if (!requestDTO.getNewPassword().equals(requestDTO.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }

        AuthUser authUser = authUserRepository.findByResetToken(requestDTO.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token"));

        if (authUser.getResetTokenExpiresAt() == null
                || authUser.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired");
        }

        authUser.setPassword(passwordEncoder.encode(requestDTO.getNewPassword()));
        authUser.setResetToken(null);
        authUser.setResetTokenExpiresAt(null);
        authUserRepository.save(authUser);

        return new AuthResponseDTO("Password reset successful", null);
    }

    private String resolveEmailFromPhone(String phone) {
        try {
            String serviceToken = jwtUtil.generateToken(phone);
            String email = doctorClient.getDoctorEmailByPhone(phone, serviceToken);
            if (email == null || email.isBlank()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
            }
            return email;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
        }
    }
}
