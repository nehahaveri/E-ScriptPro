package com.escriptpro.authservice.service;

import com.escriptpro.authservice.client.DoctorClient;
import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.DoctorAuthProfileDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.LoginResponseDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.dto.VerifyOtpRequestDTO;
import com.escriptpro.authservice.entity.AuthUser;
import com.escriptpro.authservice.mfa.MfaProperties;
import com.escriptpro.authservice.repository.AuthUserRepository;
import com.escriptpro.authservice.validation.PhoneNumberValidator;
import java.time.LocalDateTime;
import java.util.UUID;
import com.escriptpro.authservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);
    private static final String DEFAULT_PHONE_REGION = "IN";
    private static final String GENERIC_INVALID_CREDENTIALS = "Invalid credentials";

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final DoctorClient doctorClient;
    private final EmailService emailService;
    private final OtpService otpService;
    private final MfaProperties mfaProperties;

    public DoctorService(
            AuthUserRepository authUserRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            DoctorClient doctorClient,
            EmailService emailService,
            OtpService otpService,
            MfaProperties mfaProperties) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.doctorClient = doctorClient;
        this.emailService = emailService;
        this.otpService = otpService;
        this.mfaProperties = mfaProperties;
    }

    @Transactional
    public AuthResponseDTO registerDoctor(SignupRequestDTO signupRequestDTO) {
        String normalizedEmail = signupRequestDTO.getEmail().trim().toLowerCase();
        String normalizedPhone = normalizePhone(signupRequestDTO.getPhone());
        String normalizedName = signupRequestDTO.getName() == null ? null : signupRequestDTO.getName().trim();

        if (authUserRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Doctor with this email already exists");
        }

        AuthUser authUser = new AuthUser();
        authUser.setEmail(normalizedEmail);
        authUser.setPassword(passwordEncoder.encode(signupRequestDTO.getPassword()));
        authUser.setRole("DOCTOR");
        authUserRepository.save(authUser);

        try {
            String serviceToken = jwtUtil.generateServiceToken(normalizedEmail);
            doctorClient.createDoctorProfile(
                    normalizedEmail,
                    normalizedName,
                    normalizedPhone,
                    serviceToken
            );
        } catch (Exception e) {
            log.error("Doctor-service profile creation failed for email: {}. Rolling back signup.",
                    normalizedEmail, e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Account creation failed. Please try again."
            );
        }

        DoctorAuthProfileDTO doctorProfile = getDoctorProfile(normalizedEmail);
        String token = issueAccessToken(authUser, doctorProfile);
        return new AuthResponseDTO("Doctor registered successfully", token, doctorProfile.getId(), effectiveRole(authUser));
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        String emailOrPhone = loginRequestDTO.getIdentifier();
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }
        String normalizedIdentifier = emailOrPhone.trim();

        String resolvedEmail = normalizedIdentifier.contains("@")
                ? normalizedIdentifier.toLowerCase()
                : resolveEmailFromPhone(normalizedIdentifier);

        AuthUser authUser = authUserRepository.findByEmail(resolvedEmail)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), authUser.getPassword())) {
            throw invalidCredentials();
        }

        DoctorAuthProfileDTO doctorProfile = getDoctorProfile(authUser.getEmail());
        if (!isMfaEnforced()) {
            String token = issueAccessToken(authUser, doctorProfile);
            return new LoginResponseDTO("Login successful", false, null, token, doctorProfile.getId(), effectiveRole(authUser));
        }

        if (doctorProfile.getPhone() == null || doctorProfile.getPhone().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MFA is not configured for this account");
        }

        authUser.setMfaChallengeToken(UUID.randomUUID().toString());
        authUser.setMfaChallengeExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpService.issueOtp(authUser, doctorProfile.getPhone());
        authUserRepository.save(authUser);

        return new LoginResponseDTO(
                "OTP sent successfully",
                true,
                authUser.getMfaChallengeToken(),
                null,
                null,
                null
        );
    }

    @Transactional
    public ForgotPasswordResponseDTO forgotPassword(ForgotPasswordRequestDTO requestDTO) {
        String identifier = requestDTO.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }

        String resolvedEmail;
        try {
            resolvedEmail = identifier.contains("@")
                    ? identifier.trim().toLowerCase()
                    : resolveEmailFromPhone(identifier);
        } catch (ResponseStatusException ex) {
            return new ForgotPasswordResponseDTO(
                    "If the account exists, a reset link has been sent."
            );
        }

        AuthUser authUser = authUserRepository.findByEmail(resolvedEmail).orElse(null);
        if (authUser == null) {
            return new ForgotPasswordResponseDTO(
                    "If the account exists, a reset link has been sent."
            );
        }

        String resetToken = UUID.randomUUID().toString();
        authUser.setResetToken(resetToken);
        authUser.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
        authUserRepository.save(authUser);
        emailService.sendPasswordReset(authUser.getEmail(), resetToken);

        return new ForgotPasswordResponseDTO(
                "If the account exists, a reset link has been sent."
        );
    }

    @Transactional
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

        return new AuthResponseDTO("Password reset successful", null, null, null);
    }

    @Transactional
    public LoginResponseDTO verifyOtp(VerifyOtpRequestDTO requestDTO) {
        AuthUser authUser = authUserRepository.findByMfaChallengeToken(requestDTO.getMfaChallengeToken())
                .orElseThrow(this::invalidCredentials);

        if (authUser.getMfaChallengeExpiresAt() == null
                || authUser.getMfaChallengeExpiresAt().isBefore(LocalDateTime.now())) {
            otpService.clearOtp(authUser);
            authUserRepository.save(authUser);
            throw invalidCredentials();
        }

        if (!otpService.verifyOtp(authUser, requestDTO.getOtp())) {
            throw invalidCredentials();
        }

        DoctorAuthProfileDTO doctorProfile = getDoctorProfile(authUser.getEmail());
        String token = issueAccessToken(authUser, doctorProfile);
        otpService.clearOtp(authUser);
        authUserRepository.save(authUser);

        return new LoginResponseDTO(
                "Login successful",
                false,
                null,
                token,
                doctorProfile.getId(),
                effectiveRole(authUser)
        );
    }

    private String resolveEmailFromPhone(String phone) {
        try {
            String normalizedPhone = normalizePhone(phone);
            String serviceToken = jwtUtil.generateServiceToken(normalizedPhone);
            String email = doctorClient.getDoctorEmailByPhone(normalizedPhone, serviceToken);
            if (email == null || email.isBlank()) {
                throw invalidCredentials();
            }
            return email;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw invalidCredentials();
        }
    }

    private String normalizePhone(String phone) {
        try {
            return PhoneNumberValidator.toE164(phone, DEFAULT_PHONE_REGION);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid phone number");
        }
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, GENERIC_INVALID_CREDENTIALS);
    }

    private DoctorAuthProfileDTO getDoctorProfile(String email) {
        try {
            String serviceToken = jwtUtil.generateServiceToken(email);
            DoctorAuthProfileDTO doctorProfile = doctorClient.getDoctorProfileByEmail(email, serviceToken);
            if (doctorProfile == null || doctorProfile.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Doctor profile unavailable");
            }
            return doctorProfile;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Doctor profile unavailable");
        }
    }

    private String issueAccessToken(AuthUser authUser, DoctorAuthProfileDTO doctorProfile) {
        return jwtUtil.generateToken(authUser.getEmail(), doctorProfile.getId(), effectiveRole(authUser));
    }

    private String effectiveRole(AuthUser authUser) {
        if (authUser.getRole() == null || authUser.getRole().isBlank()) {
            authUser.setRole("DOCTOR");
        }
        return authUser.getRole();
    }

    private boolean isMfaEnforced() {
        String provider = mfaProperties.getProvider();
        return mfaProperties.isEnabled()
                && provider != null
                && !provider.isBlank()
                && !"noop".equalsIgnoreCase(provider.trim());
    }
}
