package com.escriptpro.doctor_service.service;

import com.escriptpro.doctor_service.dto.DoctorRegistrationRequest;
import com.escriptpro.doctor_service.dto.DoctorProfileUpdateDTO;
import com.escriptpro.doctor_service.entity.Doctor;
import com.escriptpro.doctor_service.repository.DoctorRepository;
import com.escriptpro.doctor_service.validation.PhoneNumberValidator;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);
    private static final String DEFAULT_PHONE_REGION = "IN";

    private final DoctorRepository doctorRepository;
    private final Path uploadDir = Paths.get("uploads");

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    /**
     * One-time startup migration: normalizes any legacy phone numbers to E.164
     * so that the indexed findByPhone query always works.
     */
    @PostConstruct
    void normalizeExistingPhoneNumbers() {
        List<Doctor> doctors = doctorRepository.findAll();
        int fixed = 0;
        for (Doctor doctor : doctors) {
            if (doctor.getPhone() == null || doctor.getPhone().isBlank()) {
                continue;
            }
            String normalized = safeNormalizePhone(doctor.getPhone());
            if (normalized != null && !normalized.equals(doctor.getPhone())) {
                doctor.setPhone(normalized);
                doctorRepository.save(doctor);
                fixed++;
            }
        }
        if (fixed > 0) {
            log.info("Normalized {} doctor phone number(s) to E.164 format", fixed);
        }
    }

    public Doctor createDoctor(DoctorRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedPhone = normalizePhone(request.getPhone());

        if (doctorRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with this email"
            );
        }
        if (findDoctorByNormalizedPhone(normalizedPhone).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with this phone number"
            );
        }

        Doctor doctor = new Doctor();
        doctor.setEmail(normalizedEmail);
        doctor.setName(request.getName().trim());
        doctor.setPhone(normalizedPhone);
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
        String normalizedPhone = normalizePhone(phone);
        return findDoctorByNormalizedPhone(normalizedPhone)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found"
                ));
    }

    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Doctor not found"
                ));
    }

    public Doctor updateDoctorByEmail(String email, DoctorProfileUpdateDTO request) {
        Doctor doctor = getDoctorByEmail(email);
        String normalizedPhone = request.getPhone() == null || request.getPhone().isBlank()
                ? null
                : normalizePhone(request.getPhone());

        if (normalizedPhone != null
                && !normalizedPhone.equals(doctor.getPhone())
                && findDoctorByNormalizedPhone(normalizedPhone)
                .filter(existingDoctor -> !existingDoctor.getId().equals(doctor.getId()))
                .isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Doctor already exists with this phone number"
            );
        }

        doctor.setName(trimToNull(request.getName()));
        doctor.setPhone(normalizedPhone);
        doctor.setClinicName(trimToNull(request.getClinicName()));
        doctor.setLocality(trimToNull(request.getLocality()));
        doctor.setSpecialization(trimToNull(request.getSpecialization()));
        doctor.setEducation(trimToNull(request.getEducation()));
        doctor.setExperience(request.getExperience());
        doctor.setLogoUrl(trimToNull(request.getLogoUrl()));
        doctor.setSignatureUrl(trimToNull(request.getSignatureUrl()));
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
        if (!filePath.startsWith(uploadDir)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file path");
        }
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

    private String normalizePhone(String phone) {
        try {
            return PhoneNumberValidator.toE164(phone, DEFAULT_PHONE_REGION);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid phone number");
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private java.util.Optional<Doctor> findDoctorByNormalizedPhone(String normalizedPhone) {
        return doctorRepository.findByPhone(normalizedPhone);
    }

    private String safeNormalizePhone(String phone) {
        try {
            return PhoneNumberValidator.toE164(phone, DEFAULT_PHONE_REGION);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
