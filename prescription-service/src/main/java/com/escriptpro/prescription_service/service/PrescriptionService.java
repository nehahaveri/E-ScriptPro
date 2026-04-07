package com.escriptpro.prescription_service.service;

import com.escriptpro.prescription_service.client.DoctorClient;
import com.escriptpro.prescription_service.client.MedicineClient;
import com.escriptpro.prescription_service.client.PatientClient;
import com.escriptpro.prescription_service.client.PdfClient;
import com.escriptpro.prescription_service.dto.InjectionDTO;
import com.escriptpro.prescription_service.dto.PatientResponseDTO;
import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import com.escriptpro.prescription_service.dto.SyrupDTO;
import com.escriptpro.prescription_service.dto.TabletDTO;
import com.escriptpro.prescription_service.entity.Injection;
import com.escriptpro.prescription_service.entity.Prescription;
import com.escriptpro.prescription_service.entity.Syrup;
import com.escriptpro.prescription_service.entity.Tablet;
import com.escriptpro.prescription_service.repository.InjectionRepository;
import com.escriptpro.prescription_service.repository.PrescriptionRepository;
import com.escriptpro.prescription_service.repository.SyrupRepository;
import com.escriptpro.prescription_service.repository.TabletRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class PrescriptionService {

    private static final Logger log = LoggerFactory.getLogger(PrescriptionService.class);

    private final PrescriptionRepository prescriptionRepository;
    private final TabletRepository tabletRepository;
    private final SyrupRepository syrupRepository;
    private final InjectionRepository injectionRepository;
    private final DoctorClient doctorClient;
    private final PatientClient patientClient;
    private final MedicineClient medicineClient;
    private final KafkaProducerService kafkaProducerService;
    private final PdfClient pdfClient;
    private final Path uploadDir = Path.of("uploads");

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            TabletRepository tabletRepository,
            SyrupRepository syrupRepository,
            InjectionRepository injectionRepository,
            DoctorClient doctorClient,
            PatientClient patientClient,
            MedicineClient medicineClient,
            KafkaProducerService kafkaProducerService,
            PdfClient pdfClient) {
        this.prescriptionRepository = prescriptionRepository;
        this.tabletRepository = tabletRepository;
        this.syrupRepository = syrupRepository;
        this.injectionRepository = injectionRepository;
        this.doctorClient = doctorClient;
        this.patientClient = patientClient;
        this.medicineClient = medicineClient;
        this.kafkaProducerService = kafkaProducerService;
        this.pdfClient = pdfClient;
        initializeUploadDirectory();
    }

    public byte[] createPrescription(PrescriptionRequestDTO request, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        var patient = request.getPatientId() != null ? validatePatientOwnership(request.getPatientId(), token) : null;
        if (request.getPatientId() != null) {
            request.setPatientName(patient.getName());
            request.setPatientAge(patient.getAge());
            request.setPatientGender(patient.getGender());
        }
        request.setVisitDate(LocalDate.now().toString());
        request.setShowDoctorName(resolveFlag(request.getShowDoctorName(), true));
        request.setShowClinicName(resolveFlag(request.getShowClinicName(), true));

        Prescription prescription = new Prescription();
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.getPatientId());
        prescription.setDoctorName(request.getDoctorName());
        prescription.setDoctorEmail(request.getDoctorEmail());
        prescription.setDoctorPhone(request.getDoctorPhone());
        prescription.setClinicName(request.getClinicName());
        prescription.setShowDoctorName(request.getShowDoctorName());
        prescription.setShowClinicName(request.getShowClinicName());
        prescription.setLocality(request.getLocality());
        prescription.setEducation(request.getEducation());
        prescription.setLogoUrl(request.getLogoUrl());
        prescription.setSignatureUrl(request.getSignatureUrl());
        prescription.setComplaints(request.getComplaints());
        prescription.setExamination(request.getExamination());
        prescription.setInvestigationAdvice(request.getInvestigationAdvice());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setBp(request.getBp());
        prescription.setSugar(request.getSugar());
        prescription.setTreatment(request.getTreatment());
        prescription.setFollowUp(request.getFollowUp());
        prescription.setFollowUpDate(request.getFollowUpDate());
        prescription.setXrayImageUrl(request.getXrayImageUrl());
        prescription.setAdvice(request.getAdvice());
        prescription.setConsultationFee(resolveFee(request));
        prescription.setVisitDate(LocalDate.now());

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        kafkaProducerService.sendPrescriptionEvent(request);

        if (request.getTablets() != null) {
            request.getTablets().forEach(tabletDTO -> {
                softValidateMedicine(tabletDTO.getBrand(), tabletDTO.getMedicineName(), "TABLET");

                Tablet tablet = new Tablet();
                tablet.setPrescription(savedPrescription);
                tablet.setBrand(tabletDTO.getBrand());
                tablet.setMedicineName(tabletDTO.getMedicineName());
                tablet.setMorning(tabletDTO.getMorning());
                tablet.setAfternoon(tabletDTO.getAfternoon());
                tablet.setNight(tabletDTO.getNight());
                tablet.setScheduleType(resolveMedicineScheduleType(tabletDTO.getScheduleType(), tabletDTO.getWeeklyDays()));
                tablet.setWeeklyDays(joinWeeklyDays(tabletDTO.getWeeklyDays()));
                tablet.setWithWater(tabletDTO.getWithWater());
                tablet.setChew(tabletDTO.getChew());
                tablet.setInstruction(tabletDTO.getInstruction());
                tablet.setDuration(tabletDTO.getDuration());
                tablet.setQuantity(tabletDTO.getQuantity());
                tabletRepository.save(tablet);
            });
        }

        if (request.getSyrups() != null) {
            request.getSyrups().forEach(syrupDTO -> {
                softValidateMedicine(syrupDTO.getBrand(), syrupDTO.getSyrupName(), "SYRUP");

                Syrup syrup = new Syrup();
                syrup.setPrescription(savedPrescription);
                syrup.setBrand(syrupDTO.getBrand());
                syrup.setSyrupName(syrupDTO.getSyrupName());
                syrup.setMorning(syrupDTO.getMorning());
                syrup.setAfternoon(syrupDTO.getAfternoon());
                syrup.setNight(syrupDTO.getNight());
                syrup.setScheduleType(resolveMedicineScheduleType(syrupDTO.getScheduleType(), syrupDTO.getWeeklyDays()));
                syrup.setWeeklyDays(joinWeeklyDays(syrupDTO.getWeeklyDays()));
                syrup.setDuration(syrupDTO.getDuration());
                syrup.setQuantity(syrupDTO.getQuantity());
                syrupRepository.save(syrup);
            });
        }

        if (request.getInjections() != null) {
            request.getInjections().forEach(injectionDTO -> {
                softValidateMedicine(injectionDTO.getBrand(), injectionDTO.getMedicineName(), "INJECTION");

                Injection injection = new Injection();
                injection.setPrescription(savedPrescription);
                injection.setBrand(injectionDTO.getBrand());
                injection.setMedicineName(injectionDTO.getMedicineName());
                injection.setDaily(resolveInjectionDaily(injectionDTO));
                injection.setAlternateDay(injectionDTO.getAlternateDay());
                injection.setWeeklyOnce(resolveInjectionWeekly(injectionDTO));
                injection.setScheduleType(resolveInjectionScheduleType(injectionDTO));
                injection.setWeeklyDays(joinWeeklyDays(injectionDTO.getWeeklyDays()));
                injectionRepository.save(injection);
            });
        }

        byte[] pdf = pdfClient.generatePdf(request);
        log.info("Prescription PDF generated successfully. Size={} bytes", pdf != null ? pdf.length : 0);
        return pdf;
    }

    public List<Prescription> getPrescriptionHistory(Long patientId, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        validatePatientOwnership(patientId, token);
        return prescriptionRepository.findByDoctorIdAndPatientIdOrderByVisitDateDescCreatedAtDesc(doctorId, patientId);
    }

    @Transactional
    public void deletePrescription(Long prescriptionId, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        Prescription prescription = prescriptionRepository.findByIdAndDoctorId(prescriptionId, doctorId)
                .orElseThrow(() -> resolvePrescriptionAccessError(prescriptionId));
        deletePrescriptionRecords(prescription);
    }

    @Transactional
    public void deletePrescriptionsByPatient(Long patientId, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        validatePatientOwnership(patientId, token);
        List<Prescription> prescriptions = prescriptionRepository.findByDoctorIdAndPatientId(doctorId, patientId);
        prescriptions.forEach(this::deletePrescriptionRecords);
    }

    public byte[] getPrescriptionPdf(Long prescriptionId, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        Prescription prescription = prescriptionRepository.findByIdAndDoctorId(prescriptionId, doctorId)
                .orElseThrow(() -> resolvePrescriptionAccessError(prescriptionId));
        var patient = prescription.getPatientId() != null ? validatePatientOwnership(prescription.getPatientId(), token) : null;

        PrescriptionRequestDTO request = new PrescriptionRequestDTO();
        request.setPatientId(prescription.getPatientId());
        request.setDoctorName(prescription.getDoctorName());
        request.setDoctorEmail(prescription.getDoctorEmail());
        request.setDoctorPhone(prescription.getDoctorPhone());
        request.setClinicName(prescription.getClinicName());
        request.setShowDoctorName(resolveFlag(prescription.getShowDoctorName(), true));
        request.setShowClinicName(resolveFlag(prescription.getShowClinicName(), true));
        request.setLocality(prescription.getLocality());
        request.setEducation(prescription.getEducation());
        request.setLogoUrl(prescription.getLogoUrl());
        request.setSignatureUrl(prescription.getSignatureUrl());
        request.setPatientName(patient != null ? patient.getName() : null);
        request.setPatientAge(patient != null ? patient.getAge() : null);
        request.setPatientGender(patient != null ? patient.getGender() : null);
        request.setVisitDate(prescription.getVisitDate() != null ? prescription.getVisitDate().toString() : null);
        request.setComplaints(prescription.getComplaints());
        request.setExamination(prescription.getExamination());
        request.setInvestigationAdvice(prescription.getInvestigationAdvice());
        request.setDiagnosis(prescription.getDiagnosis());
        request.setBp(prescription.getBp());
        request.setSugar(prescription.getSugar());
        request.setTreatment(prescription.getTreatment());
        request.setFollowUp(prescription.getFollowUp());
        request.setFollowUpDate(prescription.getFollowUpDate());
        request.setXrayImageUrl(prescription.getXrayImageUrl());
        request.setAdvice(prescription.getAdvice());
        request.setConsultationFee(prescription.getConsultationFee());
        request.setFee(prescription.getConsultationFee());
        request.setTablets(buildTabletDtos(prescriptionId));
        request.setSyrups(buildSyrupDtos(prescriptionId));
        request.setInjections(buildInjectionDtos(prescriptionId));

        return pdfClient.generatePdf(request);
    }

    public String uploadXray(MultipartFile file, String baseUrl) {
        validateXrayFile(file);

        String originalName = file.getOriginalFilename() == null ? "xray.jpg" : file.getOriginalFilename();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : ".jpg";
        String filename = "xray-" + UUID.randomUUID() + extension.toLowerCase();
        Path destination = uploadDir.resolve(filename).normalize();

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return baseUrl + "/prescriptions/files/" + filename;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store x-ray image");
        }
    }

    public Path resolveFilePath(String filename) {
        Path filePath = uploadDir.resolve(filename).normalize();
        if (!filePath.startsWith(uploadDir) || !Files.exists(filePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }
        return filePath;
    }

    private void softValidateMedicine(String brand, String medicineName, String type) {
        String query = firstNonBlank(medicineName, brand);
        if (query == null) {
            return;
        }

        try {
            List<Map<String, Object>> medicines = medicineClient.searchMedicines(query, type);
            if (medicines == null || medicines.isEmpty()) {
                log.info(
                        "No medicine match found. Accepting custom entry. brand='{}', medicineName='{}', type='{}'.",
                        brand, medicineName, type
                );
                medicineClient.registerCustomSuggestion(type, brand, medicineName);
            }
        } catch (Exception e) {
            log.warn(
                    "Medicine lookup failed. Accepting custom entry. brand='{}', medicineName='{}', type='{}'.",
                    brand, medicineName, type, e
            );
        }
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        if (second != null && !second.isBlank()) {
            return second;
        }
        return null;
    }

    private PatientResponseDTO validatePatientOwnership(Long patientId, String token) {
        return patientClient.getPatientById(patientId, token);
    }

    private void initializeUploadDirectory() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to initialize uploads directory", ex);
        }
    }

    private List<TabletDTO> buildTabletDtos(Long prescriptionId) {
        List<TabletDTO> result = new ArrayList<>();
        tabletRepository.findByPrescriptionId(prescriptionId).forEach(tablet -> result.add(
                new TabletDTO(
                        tablet.getBrand(),
                        tablet.getMedicineName(),
                        tablet.getMorning(),
                        tablet.getAfternoon(),
                        tablet.getNight(),
                        resolveMedicineScheduleType(tablet.getScheduleType(), splitWeeklyDays(tablet.getWeeklyDays())),
                        splitWeeklyDays(tablet.getWeeklyDays()),
                        tablet.getWithWater(),
                        tablet.getChew(),
                        tablet.getInstruction(),
                        tablet.getDuration(),
                        tablet.getQuantity()
                )
        ));
        return result;
    }

    private List<SyrupDTO> buildSyrupDtos(Long prescriptionId) {
        List<SyrupDTO> result = new ArrayList<>();
        syrupRepository.findByPrescriptionId(prescriptionId).forEach(syrup -> result.add(
                new SyrupDTO(
                        syrup.getBrand(),
                        syrup.getSyrupName(),
                        syrup.getMorning(),
                        syrup.getAfternoon(),
                        syrup.getNight(),
                        resolveMedicineScheduleType(syrup.getScheduleType(), splitWeeklyDays(syrup.getWeeklyDays())),
                        splitWeeklyDays(syrup.getWeeklyDays()),
                        syrup.getDuration(),
                        syrup.getQuantity()
                )
        ));
        return result;
    }

    private List<InjectionDTO> buildInjectionDtos(Long prescriptionId) {
        List<InjectionDTO> result = new ArrayList<>();
        injectionRepository.findByPrescriptionId(prescriptionId).forEach(injection -> result.add(
                new InjectionDTO(
                        injection.getBrand(),
                        injection.getMedicineName(),
                        injection.getDaily(),
                        injection.getAlternateDay(),
                        injection.getWeeklyOnce(),
                        deriveInjectionScheduleType(injection),
                        splitWeeklyDays(injection.getWeeklyDays())
                )
        ));
        return result;
    }

    private void validateXrayFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "X-ray image is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !List.of("image/png", "image/jpeg", "image/jpg").contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PNG and JPEG images are allowed");
        }
    }

    private ResponseStatusException resolvePrescriptionAccessError(Long prescriptionId) {
        if (prescriptionRepository.existsById(prescriptionId)) {
            return new ResponseStatusException(HttpStatus.FORBIDDEN, "Prescription does not belong to this doctor");
        }
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found");
    }

    private void deletePrescriptionRecords(Prescription prescription) {
        Long prescriptionId = prescription.getId();
        injectionRepository.deleteByPrescriptionId(prescriptionId);
        syrupRepository.deleteByPrescriptionId(prescriptionId);
        tabletRepository.deleteByPrescriptionId(prescriptionId);
        prescriptionRepository.delete(prescription);
    }

    private Integer resolveFee(PrescriptionRequestDTO request) {
        return request.getFee() != null ? request.getFee() : request.getConsultationFee();
    }

    private Boolean resolveFlag(Boolean value, boolean defaultValue) {
        return value != null ? value : defaultValue;
    }

    private Boolean resolveInjectionDaily(InjectionDTO injectionDTO) {
        if (hasText(injectionDTO.getScheduleType())) {
            return "DAILY".equalsIgnoreCase(injectionDTO.getScheduleType());
        }
        return injectionDTO.getDaily();
    }

    private Boolean resolveInjectionWeekly(InjectionDTO injectionDTO) {
        if (hasText(injectionDTO.getScheduleType())) {
            return "WEEKLY".equalsIgnoreCase(injectionDTO.getScheduleType());
        }
        return injectionDTO.getWeeklyOnce();
    }

    private String resolveInjectionScheduleType(InjectionDTO injectionDTO) {
        if (hasText(injectionDTO.getScheduleType())) {
            return injectionDTO.getScheduleType().trim().toUpperCase();
        }
        if (Boolean.TRUE.equals(injectionDTO.getWeeklyOnce())) {
            return "WEEKLY";
        }
        if (Boolean.TRUE.equals(injectionDTO.getDaily())) {
            return "DAILY";
        }
        if (Boolean.TRUE.equals(injectionDTO.getAlternateDay())) {
            return "ALTERNATE_DAY";
        }
        return null;
    }

    private String resolveMedicineScheduleType(String scheduleType, List<String> weeklyDays) {
        if (hasText(scheduleType)) {
            return scheduleType.trim().toUpperCase();
        }
        return weeklyDays != null && !weeklyDays.isEmpty() ? "WEEKLY" : "DAILY";
    }

    private String joinWeeklyDays(List<String> weeklyDays) {
        if (weeklyDays == null || weeklyDays.isEmpty()) {
            return null;
        }
        List<String> normalized = weeklyDays.stream()
                .filter(this::hasText)
                .map(day -> day.trim().toUpperCase())
                .distinct()
                .collect(Collectors.toList());
        return normalized.isEmpty() ? null : String.join(",", normalized);
    }

    private List<String> splitWeeklyDays(String weeklyDays) {
        if (!hasText(weeklyDays)) {
            return List.of();
        }
        return List.of(weeklyDays.split(",")).stream()
                .map(String::trim)
                .filter(this::hasText)
                .collect(Collectors.toList());
    }

    private String deriveInjectionScheduleType(Injection injection) {
        if (hasText(injection.getScheduleType())) {
            return injection.getScheduleType().trim().toUpperCase();
        }
        if (Boolean.TRUE.equals(injection.getWeeklyOnce())) {
            return "WEEKLY";
        }
        if (Boolean.TRUE.equals(injection.getDaily())) {
            return "DAILY";
        }
        if (Boolean.TRUE.equals(injection.getAlternateDay())) {
            return "ALTERNATE_DAY";
        }
        return null;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
