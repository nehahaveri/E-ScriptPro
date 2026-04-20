package com.escriptpro.doctor_service.service;

import com.escriptpro.doctor_service.dto.DoctorRegistrationRequest;
import com.escriptpro.doctor_service.dto.DoctorProfileUpdateDTO;
import com.escriptpro.doctor_service.entity.Doctor;
import com.escriptpro.doctor_service.repository.DoctorRepository;
import com.escriptpro.doctor_service.validation.PhoneNumberValidator;
import java.io.IOException;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DoctorService {

    private static final String DEFAULT_PHONE_REGION = "IN";

    private final DoctorRepository doctorRepository;
    private final S3Service s3Service;

    public DoctorService(DoctorRepository doctorRepository, S3Service s3Service) {
        this.doctorRepository = doctorRepository;
        this.s3Service = s3Service;
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

    public String uploadDoctorAsset(String email, String type, MultipartFile file) {
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
            Doctor doctor = getDoctorByEmail(email);
            String extension = getExtension(file.getOriginalFilename(), contentType);
            
            // S3 key format: doctors/{doctorId}/{type}.png
            String s3Key = "doctors/" + doctor.getId() + "/" + normalizedType + extension;
            
            // Upload to S3 - returns only the key
            String key = s3Service.uploadFile(s3Key, file.getInputStream(), file.getSize(), contentType);
            
            // Store only the S3 key in the doctor record
            if (normalizedType.equals("logo")) {
                doctor.setLogoUrl(key);
            } else {
                doctor.setSignatureUrl(key);
            }
            doctorRepository.save(doctor);
            return key;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file: " + e.getMessage());
        }
    }

    /**
     * Get the S3 key for a doctor's logo
     */
    public String getLogoKey(String email) {
        Doctor doctor = getDoctorByEmail(email);
        String logoKey = doctor.getLogoUrl();
        if (logoKey == null || logoKey.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Logo not found for doctor");
        }
        return logoKey;
    }

    /**
     * Get the S3 key for a doctor's signature
     */
    public String getSignatureKey(String email) {
        Doctor doctor = getDoctorByEmail(email);
        String signatureKey = doctor.getSignatureUrl();
        if (signatureKey == null || signatureKey.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Signature not found for doctor");
        }
        return signatureKey;
    }

    /**
     * Generate logo URL from key (public)
     */
    public String generateLogoUrl(String logoKey) {
        return s3Service.generateUrl(logoKey, S3Service.FileType.LOGO);
    }

    /**
     * Generate signature URL from key (presigned with 10 min expiry)
     */
    public String generateSignatureUrl(String signatureKey) {
        return s3Service.generateUrl(signatureKey, S3Service.FileType.SIGNATURE);
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

    public String generateAssetUrl(String type, String key) {
        String normalizedType = type == null ? "" : type.trim().toLowerCase(Locale.ROOT);
        if (normalizedType.equals("logo")) {
            return s3Service.generateUrl(key, S3Service.FileType.LOGO);
        } else if (normalizedType.equals("signature")) {
            return s3Service.generateUrl(key, S3Service.FileType.SIGNATURE);
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type must be logo or signature");
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private java.util.Optional<Doctor> findDoctorByNormalizedPhone(String normalizedPhone) {
        java.util.Optional<Doctor> directMatch = doctorRepository.findByPhone(normalizedPhone);
        if (directMatch.isPresent()) {
            return directMatch;
        }

        return doctorRepository.findAll().stream()
                .filter(doctor -> doctor.getPhone() != null && !doctor.getPhone().isBlank())
                .filter(doctor -> normalizedPhone.equals(safeNormalizePhone(doctor.getPhone())))
                .findFirst()
                .map(doctor -> {
                    if (!normalizedPhone.equals(doctor.getPhone())) {
                        doctor.setPhone(normalizedPhone);
                        return doctorRepository.save(doctor);
                    }
                    return doctor;
                });
    }

    private String safeNormalizePhone(String phone) {
        try {
            return PhoneNumberValidator.toE164(phone, DEFAULT_PHONE_REGION);
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
