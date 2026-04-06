package com.escriptpro.doctor_service.service;

import com.escriptpro.doctor_service.dto.DoctorProfileUpdateDTO;
import com.escriptpro.doctor_service.entity.Doctor;
import com.escriptpro.doctor_service.repository.DoctorRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final Path uploadDir = Paths.get("uploads");

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctorRepository.findByEmail(doctor.getEmail()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with email: " + doctor.getEmail()
            );
        }
        if (doctor.getPhone() != null
                && !doctor.getPhone().isBlank()
                && doctorRepository.findByPhone(doctor.getPhone()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with phone: " + doctor.getPhone()
            );
        }
        return doctorRepository.save(doctor);
    }

    public Doctor getDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found with email: " + email
                ));
    }

    public Doctor getDoctorByPhone(String phone) {
        return doctorRepository.findByPhone(phone)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found with phone: " + phone
                ));
    }

    public Doctor updateDoctorByEmail(String email, DoctorProfileUpdateDTO request) {
        Doctor doctor = getDoctorByEmail(email);

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone().equals(doctor.getPhone())
                && doctorRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with phone: " + request.getPhone()
            );
        }

        doctor.setName(request.getName());
        doctor.setPhone(request.getPhone());
        doctor.setClinicName(request.getClinicName());
        doctor.setLocality(request.getLocality());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setEducation(request.getEducation());
        doctor.setExperience(request.getExperience());
        doctor.setLogoUrl(request.getLogoUrl());
        doctor.setSignatureUrl(request.getSignatureUrl());
        return doctorRepository.save(doctor);
    }

    public String uploadDoctorAsset(String email, String type, MultipartFile file, String baseUrl) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
        }

        String normalizedType = type == null ? "" : type.trim().toLowerCase(Locale.ROOT);
        if (!normalizedType.equals("logo") && !normalizedType.equals("signature")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be logo or signature");
        }

        String contentType = file.getContentType();
        if (!"image/png".equalsIgnoreCase(contentType)
                && !"image/jpeg".equalsIgnoreCase(contentType)
                && !"image/jpg".equalsIgnoreCase(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only png/jpg files are allowed");
        }

        try {
            Files.createDirectories(uploadDir);
            String extension = getExtension(file.getOriginalFilename(), contentType);
            String filename = normalizedType + "-" + UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = baseUrl + "/doctors/files/" + filename;
            Doctor doctor = getDoctorByEmail(email);
            if (normalizedType.equals("logo")) {
                doctor.setLogoUrl(fileUrl);
            } else {
                doctor.setSignatureUrl(fileUrl);
            }
            doctorRepository.save(doctor);
            return fileUrl;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }
    }

    public Path resolveFilePath(String filename) {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        return filePath;
    }

    private String getExtension(String originalFilename, String contentType) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        }
        if ("image/png".equalsIgnoreCase(contentType)) {
            return ".png";
        }
        return ".jpg";
    }
}
