package com.escriptpro.authservice.service;

import com.escriptpro.authservice.dto.AuthResponseDTO;
import com.escriptpro.authservice.dto.LoginRequestDTO;
import com.escriptpro.authservice.dto.SignupRequestDTO;
import com.escriptpro.authservice.entity.Doctor;
import com.escriptpro.authservice.repository.DoctorRepository;
import com.escriptpro.authservice.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public DoctorService(DoctorRepository doctorRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponseDTO registerDoctor(SignupRequestDTO signupRequestDTO) {
        if (doctorRepository.findByEmail(signupRequestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor with this email already exists");
        }

        Doctor doctor = new Doctor();
        doctor.setName(signupRequestDTO.getName());
        doctor.setEmail(signupRequestDTO.getEmail());
        doctor.setPassword(signupRequestDTO.getPassword());
        doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        doctorRepository.save(doctor);

        return new AuthResponseDTO("Doctor registered successfully", null);
    }

    public AuthResponseDTO login(LoginRequestDTO loginRequestDTO) {
        Doctor doctor = doctorRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!passwordEncoder.matches(loginRequestDTO.getPassword(), doctor.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(doctor.getEmail());
        return new AuthResponseDTO("Login successful", token);
    }
}
