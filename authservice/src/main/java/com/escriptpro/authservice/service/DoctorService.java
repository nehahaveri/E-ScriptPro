package com.escriptpro.authservice.service;

import com.escriptpro.authservice.client.DoctorClient;
import com.escriptpro.authservice.client.ReceptionistClient;
import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.DoctorAuthProfileDTO;
import com.escriptpro.authservice.dto.ForgotPasswordRequestDTO;
import com.escriptpro.authservice.dto.ForgotPasswordResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.LoginResponseDTO;
import com.escriptpro.authservice.dto.ReceptionistProfileDTO;
import com.escriptpro.authservice.dto.ResetPasswordRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.dto.VerifyOtpRequestDTO;
import com.escriptpro.authservice.entity.AuthUser;
import com.escriptpro.authservice.entity.Role;
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
import org.springframework.web.client.HttpStatusCodeException;
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
    private final ReceptionistClient receptionistClient;
    private final EmailService emailService;
    private final OtpService otpService;
    private final MfaProperties mfaProperties;

    public DoctorService(
            AuthUserRepository authUserRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            DoctorClient doctorClient,
            ReceptionistClient receptionistClient,
            EmailService emailService,
            OtpService otpService,
            MfaProperties mfaProperties) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.doctorClient = doctorClient;
        this.receptionistClient = receptionistClient;
        this.emailService = emailService;
        this.otpService = otpService;
        this.mfaProperties = mfaProperties;
    }

    @Transactional
    public AuthResponseDTO registerDoctor(SignupRequestDTO signupRequestDTO) {
        String normalizedEmail = requireValue(signupRequestDTO.getEmail(), "Email is required").toLowerCase();
        String rawPassword = requireValue(signupRequestDTO.getPassword(), "Password is required");
        Role requestedRole = resolveRequestedRole(signupRequestDTO);

        if (authUserRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Account with this email already exists");
        }

        AuthUser authUser = new AuthUser();
        authUser.setEmail(normalizedEmail);
        authUser.setPassword(passwordEncoder.encode(rawPassword));
        authUser.setRole(requestedRole);

        if (requestedRole == Role.RECEPTIONIST) {
            Long assignedDoctorId = signupRequestDTO.getDoctorId();
            if (assignedDoctorId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor ID is required for receptionist signup");
            }

            DoctorAuthProfileDTO doctorProfile = validateDoctorExists(assignedDoctorId, normalizedEmail);
            String normalizedPhone = normalizePhone(requireValue(signupRequestDTO.getPhone(), "Phone number is required"));
            String normalizedName = requireValue(signupRequestDTO.getName(), "Name is required");
            authUser.setDoctorId(doctorProfile.getId());
            authUserRepository.save(authUser);

            try {
                receptionistClient.createReceptionistProfile(
                        normalizedName,
                        normalizedEmail,
                        normalizedPhone,
                        doctorProfile.getId()
                );
            } catch (HttpStatusCodeException e) {
                log.error("Receptionist-service profile creation failed for email: {}.",
                        normalizedEmail, e);
                throw new ResponseStatusException(
                        HttpStatus.valueOf(e.getStatusCode().value()),
                        extractDownstreamMessage(e.getResponseBodyAsString(), "Account creation failed. Please try again.")
                );
            } catch (Exception e) {
                log.error("Receptionist-service profile creation failed for email: {}. Rolling back signup.",
                        normalizedEmail, e);
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Account creation failed. Please try again."
                );
            }

            String token = jwtUtil.generateToken(authUser.getEmail(), authUser.getDoctorId(), effectiveRole(authUser));
            String refreshToken = issueRefreshToken(authUser);
            return new AuthResponseDTO("Receptionist registered successfully", token, refreshToken, authUser.getDoctorId(), effectiveRole(authUser));
        }

        String normalizedPhone = normalizePhone(requireValue(signupRequestDTO.getPhone(), "Phone number is required"));
        String normalizedName = requireValue(signupRequestDTO.getName(), "Name is required");

        authUserRepository.save(authUser);

        DoctorAuthProfileDTO doctorProfile;
        try {
            String serviceToken = jwtUtil.generateServiceToken(normalizedEmail);
            doctorProfile = doctorClient.createDoctorProfile(
                    normalizedEmail,
                    normalizedName,
                    normalizedPhone,
                    serviceToken
            );
            authUser.setDoctorId(doctorProfile.getId());
            authUserRepository.save(authUser);
        } catch (HttpStatusCodeException e) {
            log.error("Doctor-service profile creation failed for email: {}.",
                    normalizedEmail, e);
            throw new ResponseStatusException(
                    HttpStatus.valueOf(e.getStatusCode().value()),
                    extractDownstreamMessage(e.getResponseBodyAsString(), "Account creation failed. Please try again.")
            );
        } catch (Exception e) {
            log.error("Doctor-service profile creation failed for email: {}. Rolling back signup.",
                    normalizedEmail, e);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Account creation failed. Please try again."
            );
        }

        String token = issueAccessToken(authUser, doctorProfile.getId());
        String refreshToken = issueRefreshToken(authUser);
        return new AuthResponseDTO("Doctor registered successfully", token, refreshToken, doctorProfile.getId(), effectiveRole(authUser));
    }

    @Transactional
    public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
        String emailOrPhone = loginRequestDTO.getIdentifier();
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }
        String normalizedIdentifier = emailOrPhone.trim();
        ResolvedLoginContext loginContext = resolveLoginContext(normalizedIdentifier);
        String resolvedEmail = loginContext.email();

        AuthUser authUser = authUserRepository.findByEmail(resolvedEmail)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), authUser.getPassword())) {
            throw invalidCredentials();
        }

        Long resolvedDoctorId = resolveDoctorIdForLogin(authUser, loginContext);

        if (!isMfaEnforced()) {
            String token = issueAccessToken(authUser, resolvedDoctorId);
            String refreshToken = issueRefreshToken(authUser);
            return new LoginResponseDTO("Login successful", false, null, token, refreshToken, resolvedDoctorId, effectiveRole(authUser));
        }

        String mfaPhone = resolveMfaPhone(authUser, loginContext);
        if (mfaPhone == null || mfaPhone.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "MFA is not configured for this account");
        }

        authUser.setMfaChallengeToken(UUID.randomUUID().toString());
        authUser.setMfaChallengeExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpService.issueOtp(authUser, mfaPhone);
        authUserRepository.save(authUser);

        return new LoginResponseDTO(
                "OTP sent successfully",
                true,
                authUser.getMfaChallengeToken(),
                null,
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
            resolvedEmail = resolveLoginContext(identifier.trim()).email();
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

        return new AuthResponseDTO("Password reset successful", null, null, null, null);
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

        Long resolvedDoctorId = resolveDoctorIdForVerifiedUser(authUser);
        String token = issueAccessToken(authUser, resolvedDoctorId);
        String refreshToken = issueRefreshToken(authUser);
        otpService.clearOtp(authUser);
        authUserRepository.save(authUser);

        return new LoginResponseDTO(
                "Login successful",
                false,
                null,
                token,
                refreshToken,
                resolvedDoctorId,
                effectiveRole(authUser)
        );
    }

    private ResolvedLoginContext resolveLoginContext(String identifier) {
        if (identifier.contains("@")) {
            String normalizedEmail = identifier.toLowerCase();
            AuthUser authUser = authUserRepository.findByEmail(normalizedEmail)
                    .orElseThrow(this::invalidCredentials);
            return buildLoginContext(authUser, normalizedEmail);
        }

        String normalizedPhone = normalizePhone(identifier);

        ReceptionistProfileDTO receptionistProfile = getReceptionistProfileByPhone(normalizedPhone);
        if (receptionistProfile != null && receptionistProfile.getEmail() != null && !receptionistProfile.getEmail().isBlank()) {
            return new ResolvedLoginContext(
                    receptionistProfile.getEmail().toLowerCase(),
                    Role.RECEPTIONIST,
                    receptionistProfile.getDoctorId(),
                    receptionistProfile.getPhone()
            );
        }

        DoctorAuthProfileDTO doctorProfile = resolveDoctorProfileFromPhone(normalizedPhone);
        return new ResolvedLoginContext(
                doctorProfile.getEmail().toLowerCase(),
                Role.DOCTOR,
                doctorProfile.getId(),
                doctorProfile.getPhone()
        );
    }

    private DoctorAuthProfileDTO resolveDoctorProfileFromPhone(String phone) {
        try {
            String serviceToken = jwtUtil.generateServiceToken(phone);
            DoctorAuthProfileDTO doctorProfile = doctorClient.getDoctorProfileByPhone(phone, serviceToken);
            if (doctorProfile == null || doctorProfile.getEmail() == null || doctorProfile.getEmail().isBlank()) {
                throw invalidCredentials();
            }
            return doctorProfile;
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

    private ReceptionistProfileDTO getReceptionistProfileByEmail(String email) {
        try {
            ReceptionistProfileDTO receptionistProfile = receptionistClient.getReceptionistByEmail(email);
            if (receptionistProfile == null || receptionistProfile.getDoctorId() == null) {
                throw invalidCredentials();
            }
            return receptionistProfile;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw invalidCredentials();
        }
    }

    private ReceptionistProfileDTO getReceptionistProfileByPhone(String phone) {
        try {
            ReceptionistProfileDTO receptionistProfile = receptionistClient.getReceptionistByPhone(phone);
            if (receptionistProfile == null || receptionistProfile.getDoctorId() == null) {
                return null;
            }
            return receptionistProfile;
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            throw ex;
        } catch (Exception ex) {
            return null;
        }
    }

    private ResolvedLoginContext buildLoginContext(AuthUser authUser, String normalizedEmail) {
        Role role = authUser.getRole() == null ? Role.DOCTOR : authUser.getRole();
        if (role == Role.RECEPTIONIST) {
            ReceptionistProfileDTO receptionistProfile = getReceptionistProfileByEmail(normalizedEmail);
            return new ResolvedLoginContext(
                    normalizedEmail,
                    Role.RECEPTIONIST,
                    receptionistProfile.getDoctorId(),
                    receptionistProfile.getPhone()
            );
        }

        DoctorAuthProfileDTO doctorProfile = getDoctorProfile(normalizedEmail);
        return new ResolvedLoginContext(
                normalizedEmail,
                Role.DOCTOR,
                doctorProfile.getId(),
                doctorProfile.getPhone()
        );
    }

    private Long resolveDoctorIdForLogin(AuthUser authUser, ResolvedLoginContext loginContext) {
        if (loginContext.doctorId() != null) {
            return loginContext.doctorId();
        }
        return authUser.getDoctorId();
    }

    private String resolveMfaPhone(AuthUser authUser, ResolvedLoginContext loginContext) {
        if (loginContext.phone() != null && !loginContext.phone().isBlank()) {
            return loginContext.phone();
        }
        if ((authUser.getRole() == null ? Role.DOCTOR : authUser.getRole()) == Role.RECEPTIONIST) {
            ReceptionistProfileDTO receptionistProfile = getReceptionistProfileByEmail(authUser.getEmail());
            return receptionistProfile.getPhone();
        }
        return getDoctorProfile(authUser.getEmail()).getPhone();
    }

    private Long resolveDoctorIdForVerifiedUser(AuthUser authUser) {
        Role role = authUser.getRole() == null ? Role.DOCTOR : authUser.getRole();
        if (role == Role.RECEPTIONIST) {
            ReceptionistProfileDTO receptionistProfile = getReceptionistProfileByEmail(authUser.getEmail());
            return receptionistProfile.getDoctorId();
        }
        DoctorAuthProfileDTO doctorProfile = getDoctorProfile(authUser.getEmail());
        return doctorProfile.getId();
    }

    private String issueAccessToken(AuthUser authUser, Long resolvedDoctorId) {
        Long doctorId = resolvedDoctorId != null ? resolvedDoctorId : authUser.getDoctorId();
        return jwtUtil.generateToken(authUser.getEmail(), doctorId, effectiveRole(authUser));
    }

    private String issueRefreshToken(AuthUser authUser) {
        String refreshToken = UUID.randomUUID().toString();
        authUser.setRefreshToken(refreshToken);
        authUser.setRefreshTokenExpiresAt(LocalDateTime.now().plusDays(jwtUtil.getRefreshTokenExpirationDays()));
        authUserRepository.save(authUser);
        return refreshToken;
    }

    @Transactional
    public AuthResponseDTO refreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token is required");
        }

        AuthUser authUser = authUserRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (authUser.getRefreshTokenExpiresAt() == null
                || authUser.getRefreshTokenExpiresAt().isBefore(LocalDateTime.now())) {
            authUser.setRefreshToken(null);
            authUser.setRefreshTokenExpiresAt(null);
            authUserRepository.save(authUser);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired. Please login again.");
        }

        Long doctorId = authUser.getDoctorId();
        String accessToken = issueAccessToken(authUser, doctorId);
        String newRefreshToken = issueRefreshToken(authUser);

        return new AuthResponseDTO("Token refreshed", accessToken, newRefreshToken, doctorId, effectiveRole(authUser));
    }

    private String effectiveRole(AuthUser authUser) {
        if (authUser.getRole() == null) {
            authUser.setRole(Role.DOCTOR);
        }
        return authUser.getRole().name();
    }

    private boolean isMfaEnforced() {
        String provider = mfaProperties.getProvider();
        return mfaProperties.isEnabled()
                && provider != null
                && !provider.isBlank()
                && !"noop".equalsIgnoreCase(provider.trim());
    }

    private Role resolveRequestedRole(SignupRequestDTO signupRequestDTO) {
        return signupRequestDTO.getRole() == null ? Role.DOCTOR : signupRequestDTO.getRole();
    }

    private String requireValue(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return value.trim();
    }

    private String extractDownstreamMessage(String responseBody, String fallback) {
        if (responseBody == null || responseBody.isBlank()) {
            return fallback;
        }

        int messageIndex = responseBody.indexOf("\"message\"");
        if (messageIndex < 0) {
            return fallback;
        }
        int colonIndex = responseBody.indexOf(':', messageIndex);
        int startQuote = responseBody.indexOf('"', colonIndex + 1);
        int endQuote = responseBody.indexOf('"', startQuote + 1);
        if (colonIndex < 0 || startQuote < 0 || endQuote < 0) {
            return fallback;
        }
        return responseBody.substring(startQuote + 1, endQuote);
    }

    private DoctorAuthProfileDTO validateDoctorExists(Long doctorId, String normalizedEmail) {
        try {
            String serviceToken = jwtUtil.generateServiceToken(normalizedEmail);
            DoctorAuthProfileDTO doctorProfile = doctorClient.getDoctorProfileById(doctorId, serviceToken);
            if (doctorProfile == null || doctorProfile.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned doctor does not exist");
            }
            return doctorProfile;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned doctor does not exist");
        }
    }

    private record ResolvedLoginContext(String email, Role role, Long doctorId, String phone) {
    }
}
