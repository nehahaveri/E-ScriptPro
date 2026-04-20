package com.escriptpro.doctor_service.controller;

import com.escriptpro.doctor_service.dto.DoctorRegistrationRequest;
import com.escriptpro.doctor_service.dto.DoctorProfileUpdateDTO;
import com.escriptpro.doctor_service.dto.FileUploadResponseDTO;
import com.escriptpro.doctor_service.entity.Doctor;
import com.escriptpro.doctor_service.service.DoctorService;
import com.escriptpro.doctor_service.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final JwtUtil jwtUtil;

    public DoctorController(DoctorService doctorService, JwtUtil jwtUtil) {
        this.doctorService = doctorService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public Doctor createDoctor(@Valid @RequestBody DoctorRegistrationRequest request) {
        return doctorService.createDoctor(request);
    }

    @GetMapping("/email/{email}")
    public Doctor getDoctorByEmail(@PathVariable String email) {
        return doctorService.getDoctorByEmail(email);
    }

    @GetMapping("/phone/{phone}")
    public Doctor getDoctorByPhone(@PathVariable String phone) {
        return doctorService.getDoctorByPhone(phone);
    }

    @GetMapping("/{doctorId}")
    public Doctor getDoctorById(@PathVariable Long doctorId) {
        return doctorService.getDoctorById(doctorId);
    }

    @GetMapping("/me")
    public Doctor getMyProfile(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        return doctorService.getDoctorByEmail(email);
    }

    @PutMapping("/me")
    public Doctor updateMyProfile(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody DoctorProfileUpdateDTO request) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        return doctorService.updateDoctorByEmail(email, request);
    }

    @PostMapping("/upload")
    public FileUploadResponseDTO uploadDoctorAsset(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        doctorService.uploadDoctorAsset(email, type, file);
        return new FileUploadResponseDTO("Uploaded successfully", "Uploaded successfully");
    }

    @GetMapping("/logo")
    public FileUploadResponseDTO getLogoUrl(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String key = doctorService.getLogoKey(email);
        String url = doctorService.generateLogoUrl(key);
        return new FileUploadResponseDTO(url, "Logo URL");
    }

    @GetMapping("/signature")
    public FileUploadResponseDTO getSignatureUrl(@RequestHeader("Authorization") String authorizationHeader) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String key = doctorService.getSignatureKey(email);
        String url = doctorService.generateSignatureUrl(key);
        return new FileUploadResponseDTO(url, "Signature URL");
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }
}
