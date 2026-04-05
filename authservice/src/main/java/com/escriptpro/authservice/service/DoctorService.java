package com.escriptpro.authservice.service;

import com.escriptpro.authservice.client.DoctorClient;
import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.entity.AuthUser;
import com.escriptpro.authservice.repository.AuthUserRepository;
import com.escriptpro.authservice.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (authUserRepository.findByEmail(signupRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor with this email already exists");
        }

        AuthUser authUser = new AuthUser();
        authUser.setEmail(signupRequestDTO.getEmail());
        authUser.setPassword(passwordEncoder.encode(signupRequestDTO.getPassword()));
        authUserRepository.save(authUser);

        try {
            String serviceToken = jwtUtil.generateToken(signupRequestDTO.getEmail());
            doctorClient.createDoctorProfile(signupRequestDTO.getEmail(), signupRequestDTO.getName(), serviceToken);
        } catch (Exception e) {
            log.error("Doctor-service profile creation failed for email: {}. Signup will continue.",
                    signupRequestDTO.getEmail(), e);
        }

        return new AuthResponseDTO("Doctor registered successfully", null);
    }

    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {
        AuthUser authUser = authUserRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), authUser.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(authUser.getEmail());
        return new AuthResponseDTO("Login successful", token);
    }
}
