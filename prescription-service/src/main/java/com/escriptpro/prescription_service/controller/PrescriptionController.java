package com.escriptpro.prescription_service.controller;

import com.escriptpro.prescription_service.dto.FileUploadResponseDTO;
import com.escriptpro.prescription_service.dto.FollowUpAppointmentDTO;
import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import com.escriptpro.prescription_service.entity.Prescription;
import com.escriptpro.prescription_service.service.PrescriptionService;
import com.escriptpro.prescription_service.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/prescriptions")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final JwtUtil jwtUtil;

    public PrescriptionController(PrescriptionService prescriptionService, JwtUtil jwtUtil) {
        this.prescriptionService = prescriptionService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<byte[]> createPrescription(
            @RequestBody PrescriptionRequestDTO request,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        byte[] pdf = prescriptionService.createPrescription(request, email, token);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=prescription.pdf")
                .body(pdf);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptionHistory(
            @PathVariable Long patientId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        List<Prescription> history = prescriptionService.getPrescriptionHistory(patientId, email, token);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<List<FollowUpAppointmentDTO>> getFollowUpsByDate(
            @RequestParam("date") String date,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        List<FollowUpAppointmentDTO> appointments = prescriptionService.getFollowUpsByDate(date, email, token);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{prescriptionId}/pdf")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(
            @PathVariable Long prescriptionId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        byte[] pdf = prescriptionService.getPrescriptionPdf(prescriptionId, email, token);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=prescription-" + prescriptionId + ".pdf")
                .body(pdf);
    }

    @DeleteMapping("/{prescriptionId}")
    public ResponseEntity<Map<String, String>> deletePrescription(
            @PathVariable Long prescriptionId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        prescriptionService.deletePrescription(prescriptionId, email, token);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @DeleteMapping("/patient/{patientId}")
    public ResponseEntity<Map<String, String>> deletePatientPrescriptionHistory(
            @PathVariable Long patientId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        String token = extractBearerToken(authorizationHeader);
        String email = jwtUtil.extractUsername(token);
        prescriptionService.deletePrescriptionsByPatient(patientId, email, token);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    @PostMapping("/upload-xray")
    public FileUploadResponseDTO uploadXray(
            @RequestParam("file") MultipartFile file,
            @RequestParam("prescriptionId") Long prescriptionId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        extractBearerToken(authorizationHeader);
        prescriptionService.uploadXray(prescriptionId, file);
        return new FileUploadResponseDTO("Uploaded successfully", "Uploaded successfully");
    }

    @GetMapping("/{prescriptionId}/xray-url")
    public FileUploadResponseDTO getXrayUrl(
            @PathVariable Long prescriptionId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        extractBearerToken(authorizationHeader);
        String fileUrl = prescriptionService.getXrayUrl(prescriptionId);
        return new FileUploadResponseDTO(fileUrl, "X-ray URL");
    }

    @PutMapping("/{id}/update-pdf-key")
    public ResponseEntity<Void> updatePrescriptionPdfKey(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String pdfKey = request.get("pdfKey");
        if (pdfKey == null || pdfKey.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pdfKey is required");
        }
        prescriptionService.updatePrescriptionPdfKey(id, pdfKey);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{prescriptionId}/pdf-url")
    public FileUploadResponseDTO getPrescriptionPdfUrl(
            @PathVariable Long prescriptionId,
            HttpServletRequest httpRequest) {
        String authorizationHeader = httpRequest.getHeader("Authorization");
        extractBearerToken(authorizationHeader);
        String fileUrl = prescriptionService.getPrescriptionPdfUrl(prescriptionId);
        return new FileUploadResponseDTO(fileUrl, "Prescription PDF URL");
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        return authorizationHeader.substring(7);
    }
}
