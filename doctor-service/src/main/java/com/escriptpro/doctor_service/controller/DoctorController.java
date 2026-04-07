package com.escriptpro.doctor_service.controller;

import com.escriptpro.doctor_service.dto.DoctorRegistrationRequest;
import com.escriptpro.doctor_service.dto.DoctorProfileUpdateDTO;
import com.escriptpro.doctor_service.dto.FileUploadResponseDTO;
import com.escriptpro.doctor_service.entity.Doctor;
import com.escriptpro.doctor_service.service.DoctorService;
import com.escriptpro.doctor_service.util.JwtUtil;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
            @RequestParam("type") String type,
            jakarta.servlet.http.HttpServletRequest request) {
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        String fileUrl = doctorService.uploadDoctorAsset(email, type, file, baseUrl);
        return new FileUploadResponseDTO(fileUrl, "Uploaded successfully");
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<ByteArrayResource> getUploadedFile(@PathVariable String filename) throws IOException {
        Path filePath = doctorService.resolveFilePath(filename);
        byte[] fileBytes = Files.readAllBytes(filePath);

        MediaType mediaType = filename.toLowerCase().endsWith(".png")
                ? MediaType.IMAGE_PNG
                : MediaType.IMAGE_JPEG;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(new ByteArrayResource(fileBytes));
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }
}
