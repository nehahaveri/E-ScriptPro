package com.escriptpro.prescription_service.service;

import com.escriptpro.prescription_service.client.DoctorClient;
import com.escriptpro.prescription_service.client.MedicineClient;
import com.escriptpro.prescription_service.client.PatientClient;
import com.escriptpro.prescription_service.client.PdfClient;
import com.escriptpro.prescription_service.dto.CapsuleDTO;
import com.escriptpro.prescription_service.dto.CreamDTO;
import com.escriptpro.prescription_service.dto.FollowUpAppointmentDTO;
import com.escriptpro.prescription_service.dto.GelDTO;
import com.escriptpro.prescription_service.dto.InjectionDTO;
import com.escriptpro.prescription_service.dto.LotionDTO;
import com.escriptpro.prescription_service.dto.OintmentDTO;
import com.escriptpro.prescription_service.dto.PatientResponseDTO;
import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import com.escriptpro.prescription_service.dto.SuspensionDTO;
import com.escriptpro.prescription_service.dto.SyrupDTO;
import com.escriptpro.prescription_service.dto.TabletDTO;
import com.escriptpro.prescription_service.entity.Capsule;
import com.escriptpro.prescription_service.entity.Cream;
import com.escriptpro.prescription_service.entity.Gel;
import com.escriptpro.prescription_service.entity.Injection;
import com.escriptpro.prescription_service.entity.Lotion;
import com.escriptpro.prescription_service.entity.Ointment;
import com.escriptpro.prescription_service.entity.Prescription;
import com.escriptpro.prescription_service.entity.Suspension;
import com.escriptpro.prescription_service.entity.Syrup;
import com.escriptpro.prescription_service.entity.Tablet;
import com.escriptpro.prescription_service.repository.CapsuleRepository;
import com.escriptpro.prescription_service.repository.CreamRepository;
import com.escriptpro.prescription_service.repository.GelRepository;
import com.escriptpro.prescription_service.repository.InjectionRepository;
import com.escriptpro.prescription_service.repository.LotionRepository;
import com.escriptpro.prescription_service.repository.OintmentRepository;
import com.escriptpro.prescription_service.repository.PrescriptionRepository;
import com.escriptpro.prescription_service.repository.SuspensionRepository;
import com.escriptpro.prescription_service.repository.SyrupRepository;
import com.escriptpro.prescription_service.repository.TabletRepository;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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
    private final CapsuleRepository capsuleRepository;
    private final SyrupRepository syrupRepository;
    private final InjectionRepository injectionRepository;
    private final LotionRepository lotionRepository;
    private final CreamRepository creamRepository;
    private final OintmentRepository ointmentRepository;
    private final GelRepository gelRepository;
    private final SuspensionRepository suspensionRepository;
    private final DoctorClient doctorClient;
    private final PatientClient patientClient;
    private final MedicineClient medicineClient;
    private final KafkaProducerService kafkaProducerService;
    private final PdfClient pdfClient;
    private final S3Service s3Service;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            TabletRepository tabletRepository,
            CapsuleRepository capsuleRepository,
            SyrupRepository syrupRepository,
            InjectionRepository injectionRepository,
            LotionRepository lotionRepository,
            CreamRepository creamRepository,
            OintmentRepository ointmentRepository,
            GelRepository gelRepository,
            SuspensionRepository suspensionRepository,
            DoctorClient doctorClient,
            PatientClient patientClient,
            MedicineClient medicineClient,
            KafkaProducerService kafkaProducerService,
            PdfClient pdfClient,
            S3Service s3Service) {
        this.prescriptionRepository = prescriptionRepository;
        this.tabletRepository = tabletRepository;
        this.capsuleRepository = capsuleRepository;
        this.syrupRepository = syrupRepository;
        this.injectionRepository = injectionRepository;
        this.lotionRepository = lotionRepository;
        this.creamRepository = creamRepository;
        this.ointmentRepository = ointmentRepository;
        this.gelRepository = gelRepository;
        this.suspensionRepository = suspensionRepository;
        this.doctorClient = doctorClient;
        this.patientClient = patientClient;
        this.medicineClient = medicineClient;
        this.kafkaProducerService = kafkaProducerService;
        this.pdfClient = pdfClient;
        this.s3Service = s3Service;
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
        
        // Set doctorId and prescriptionId in the request for PDF generation
        request.setDoctorId(doctorId);
        request.setPrescriptionId(savedPrescription.getId());
        
        kafkaProducerService.sendPrescriptionEvent(request);

        if (request.getTablets() != null) {
            request.getTablets().forEach(dto -> {
                softValidateMedicine(dto.getName(), "TABLET");
                Tablet entity = new Tablet();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setWithWater(dto.getWithWater());
                entity.setChew(dto.getChew());
                entity.setInstruction(dto.getInstruction());
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                tabletRepository.save(entity);
            });
        }

        if (request.getCapsules() != null) {
            request.getCapsules().forEach(dto -> {
                softValidateMedicine(dto.getName(), "CAPSULE");
                Capsule entity = new Capsule();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setWithWater(dto.getWithWater());
                entity.setChew(dto.getChew());
                entity.setInstruction(dto.getInstruction());
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                capsuleRepository.save(entity);
            });
        }

        if (request.getSyrups() != null) {
            request.getSyrups().forEach(dto -> {
                softValidateMedicine(dto.getName(), "SYRUP");
                Syrup entity = new Syrup();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setIntakeType(dto.getIntakeType());
                entity.setIntakeValue(dto.getIntakeValue());
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                syrupRepository.save(entity);
            });
        }

        if (request.getInjections() != null) {
            request.getInjections().forEach(dto -> {
                softValidateMedicine(dto.getName(), "INJECTION");
                Injection entity = new Injection();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setDaily(resolveInjectionDaily(dto));
                entity.setAlternateDay(dto.getAlternateDay());
                entity.setWeeklyOnce(resolveInjectionWeekly(dto));
                entity.setScheduleType(resolveInjectionScheduleType(dto));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                injectionRepository.save(entity);
            });
        }

        if (request.getLotions() != null) {
            request.getLotions().forEach(dto -> {
                softValidateMedicine(dto.getName(), "LOTION");
                Lotion entity = new Lotion();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setApplicationArea(dto.getApplicationArea());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                lotionRepository.save(entity);
            });
        }

        if (request.getCreams() != null) {
            request.getCreams().forEach(dto -> {
                softValidateMedicine(dto.getName(), "CREAM");
                Cream entity = new Cream();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setApplicationArea(dto.getApplicationArea());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                creamRepository.save(entity);
            });
        }

        if (request.getOintments() != null) {
            request.getOintments().forEach(dto -> {
                softValidateMedicine(dto.getName(), "OINTMENT");
                Ointment entity = new Ointment();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setApplicationArea(dto.getApplicationArea());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                ointmentRepository.save(entity);
            });
        }

        if (request.getGels() != null) {
            request.getGels().forEach(dto -> {
                softValidateMedicine(dto.getName(), "GEL");
                Gel entity = new Gel();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setApplicationArea(dto.getApplicationArea());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                gelRepository.save(entity);
            });
        }

        if (request.getSuspensions() != null) {
            request.getSuspensions().forEach(dto -> {
                softValidateMedicine(dto.getName(), "SUSPENSION");
                Suspension entity = new Suspension();
                entity.setPrescription(savedPrescription);
                entity.setName(dto.getName());
                entity.setMorning(dto.getMorning());
                entity.setAfternoon(dto.getAfternoon());
                entity.setNight(dto.getNight());
                entity.setScheduleType(resolveMedicineScheduleType(dto.getScheduleType(), dto.getWeeklyDays()));
                entity.setWeeklyDays(joinWeeklyDays(dto.getWeeklyDays()));
                entity.setIntakeType(dto.getIntakeType());
                entity.setIntakeValue(dto.getIntakeValue());
                entity.setDuration(dto.getDuration());
                entity.setQuantity(dto.getQuantity());
                suspensionRepository.save(entity);
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

    public List<FollowUpAppointmentDTO> getFollowUpsByDate(String followUpDate, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        List<Prescription> prescriptions = prescriptionRepository
                .findByDoctorIdAndFollowUpDateOrderByCreatedAtAsc(doctorId, followUpDate);

        Map<Long, FollowUpAppointmentDTO> appointmentsByPatient = new LinkedHashMap<>();
        for (Prescription prescription : prescriptions) {
            if (prescription.getPatientId() == null) {
                continue;
            }

            PatientResponseDTO patient = validatePatientOwnership(prescription.getPatientId(), token);
            appointmentsByPatient.put(
                    patient.getId(),
                    new FollowUpAppointmentDTO(
                            prescription.getId(),
                            patient.getId(),
                            patient.getPatientNumber(),
                            patient.getName(),
                            patient.getMobile(),
                            patient.getAge(),
                            patient.getGender(),
                            prescription.getFollowUpDate(),
                            prescription.getDiagnosis()
                    )
            );
        }

        return new ArrayList<>(appointmentsByPatient.values());
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
        request.setLogoUrl(convertS3KeyToUrl(prescription.getLogoUrl(), S3Service.FileType.LOGO));
        request.setSignatureUrl(convertS3KeyToUrl(prescription.getSignatureUrl(), S3Service.FileType.SIGNATURE));
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
        request.setXrayImageUrl(convertS3KeyToUrl(prescription.getXrayImageUrl(), S3Service.FileType.XRAY));
        request.setAdvice(prescription.getAdvice());
        request.setConsultationFee(prescription.getConsultationFee());
        request.setFee(prescription.getConsultationFee());
        request.setTablets(buildTabletDtos(prescriptionId));
        request.setCapsules(buildCapsuleDtos(prescriptionId));
        request.setSyrups(buildSyrupDtos(prescriptionId));
        request.setInjections(buildInjectionDtos(prescriptionId));
        request.setLotions(buildLotionDtos(prescriptionId));
        request.setCreams(buildCreamDtos(prescriptionId));
        request.setOintments(buildOintmentDtos(prescriptionId));
        request.setGels(buildGelDtos(prescriptionId));
        request.setSuspensions(buildSuspensionDtos(prescriptionId));

        return pdfClient.generatePdf(request);
    }

    public String uploadXray(Long prescriptionId, MultipartFile file) {
        validateXrayFile(file);

        String originalName = file.getOriginalFilename() == null ? "xray.jpg" : file.getOriginalFilename();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.')) : ".jpg";
        extension = extension.toLowerCase();

        try {
            // S3 key format: doctors/{doctorId}/prescriptions/{prescriptionId}/xray.ext
            Prescription prescription = prescriptionRepository.findById(prescriptionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
            
            String s3Key = "doctors/" + prescription.getDoctorId() + "/prescriptions/" + prescriptionId + "/xray" + extension;
            
            // Upload to S3 - returns only the key
            String key = s3Service.uploadFile(s3Key, file.getInputStream(), file.getSize(), file.getContentType());
            return key;
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store x-ray image");
        }
    }

    /**
     * Get presigned URL for X-ray file
     */
    public String getXrayUrl(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        String xrayKey = prescription.getXrayImageUrl();
        if (xrayKey == null || xrayKey.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "X-ray not found for prescription");
        }
        
        return s3Service.generateUrl(xrayKey, S3Service.FileType.XRAY);
    }

    /**
     * Update prescription with PDF key after PDF generation
     */
    @Transactional
    public void updatePrescriptionPdfKey(Long prescriptionId, String pdfKey) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        prescription.setPdfUrl(pdfKey);
        prescriptionRepository.save(prescription);
        log.info("Updated prescription {} with PDF key: {}", prescriptionId, pdfKey);
    }

    /**
     * Get presigned URL for prescription PDF
     */
    public String getPrescriptionPdfUrl(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prescription not found"));
        
        String pdfKey = prescription.getPdfUrl();
        if (pdfKey == null || pdfKey.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "PDF not found for prescription");
        }
        
        return s3Service.generateUrl(pdfKey, S3Service.FileType.PRESCRIPTION_PDF);
    }

    private void softValidateMedicine(String name, String type) {
        if (name == null || name.isBlank()) {
            return;
        }

        try {
            List<Map<String, Object>> medicines = medicineClient.searchMedicines(name, type);
            if (medicines == null || medicines.isEmpty()) {
                log.info("No medicine match found. Accepting custom entry. name='{}', type='{}'.", name, type);
                medicineClient.registerCustomSuggestion(type, name);
            }
        } catch (Exception e) {
            log.warn("Medicine lookup failed. Accepting custom entry. name='{}', type='{}'.", name, type, e);
        }
    }

    private PatientResponseDTO validatePatientOwnership(Long patientId, String token) {
        return patientClient.getPatientById(patientId, token);
    }

    private List<TabletDTO> buildTabletDtos(Long prescriptionId) {
        List<TabletDTO> result = new ArrayList<>();
        tabletRepository.findByPrescriptionId(prescriptionId).forEach(tablet -> result.add(
                new TabletDTO(
                        tablet.getName(),
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

    private List<CapsuleDTO> buildCapsuleDtos(Long prescriptionId) {
        List<CapsuleDTO> result = new ArrayList<>();
        capsuleRepository.findByPrescriptionId(prescriptionId).forEach(capsule -> result.add(
                new CapsuleDTO(
                        capsule.getName(),
                        capsule.getMorning(),
                        capsule.getAfternoon(),
                        capsule.getNight(),
                        resolveMedicineScheduleType(capsule.getScheduleType(), splitWeeklyDays(capsule.getWeeklyDays())),
                        splitWeeklyDays(capsule.getWeeklyDays()),
                        capsule.getWithWater(),
                        capsule.getChew(),
                        capsule.getInstruction(),
                        capsule.getDuration(),
                        capsule.getQuantity()
                )
        ));
        return result;
    }

    private List<SyrupDTO> buildSyrupDtos(Long prescriptionId) {
        List<SyrupDTO> result = new ArrayList<>();
        syrupRepository.findByPrescriptionId(prescriptionId).forEach(syrup -> result.add(
                new SyrupDTO(
                        syrup.getName(),
                        syrup.getMorning(),
                        syrup.getAfternoon(),
                        syrup.getNight(),
                        resolveMedicineScheduleType(syrup.getScheduleType(), splitWeeklyDays(syrup.getWeeklyDays())),
                        splitWeeklyDays(syrup.getWeeklyDays()),
                        syrup.getIntakeType(),
                        syrup.getIntakeValue(),
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
                        injection.getName(),
                        injection.getDaily(),
                        injection.getAlternateDay(),
                        injection.getWeeklyOnce(),
                        deriveInjectionScheduleType(injection),
                        splitWeeklyDays(injection.getWeeklyDays())
                )
        ));
        return result;
    }

    private List<LotionDTO> buildLotionDtos(Long prescriptionId) {
        List<LotionDTO> result = new ArrayList<>();
        lotionRepository.findByPrescriptionId(prescriptionId).forEach(lotion -> result.add(
                new LotionDTO(
                        lotion.getName(),
                        lotion.getApplicationArea(),
                        lotion.getMorning(),
                        lotion.getAfternoon(),
                        lotion.getNight(),
                        resolveMedicineScheduleType(lotion.getScheduleType(), splitWeeklyDays(lotion.getWeeklyDays())),
                        splitWeeklyDays(lotion.getWeeklyDays()),
                        lotion.getDuration(),
                        lotion.getQuantity()
                )
        ));
        return result;
    }

    private List<CreamDTO> buildCreamDtos(Long prescriptionId) {
        List<CreamDTO> result = new ArrayList<>();
        creamRepository.findByPrescriptionId(prescriptionId).forEach(cream -> result.add(
                new CreamDTO(
                        cream.getName(),
                        cream.getApplicationArea(),
                        cream.getMorning(),
                        cream.getAfternoon(),
                        cream.getNight(),
                        resolveMedicineScheduleType(cream.getScheduleType(), splitWeeklyDays(cream.getWeeklyDays())),
                        splitWeeklyDays(cream.getWeeklyDays()),
                        cream.getDuration(),
                        cream.getQuantity()
                )
        ));
        return result;
    }

    private List<OintmentDTO> buildOintmentDtos(Long prescriptionId) {
        List<OintmentDTO> result = new ArrayList<>();
        ointmentRepository.findByPrescriptionId(prescriptionId).forEach(ointment -> result.add(
                new OintmentDTO(
                        ointment.getName(),
                        ointment.getApplicationArea(),
                        ointment.getMorning(),
                        ointment.getAfternoon(),
                        ointment.getNight(),
                        resolveMedicineScheduleType(ointment.getScheduleType(), splitWeeklyDays(ointment.getWeeklyDays())),
                        splitWeeklyDays(ointment.getWeeklyDays()),
                        ointment.getDuration(),
                        ointment.getQuantity()
                )
        ));
        return result;
    }

    private List<GelDTO> buildGelDtos(Long prescriptionId) {
        List<GelDTO> result = new ArrayList<>();
        gelRepository.findByPrescriptionId(prescriptionId).forEach(gel -> result.add(
                new GelDTO(
                        gel.getName(),
                        gel.getApplicationArea(),
                        gel.getMorning(),
                        gel.getAfternoon(),
                        gel.getNight(),
                        resolveMedicineScheduleType(gel.getScheduleType(), splitWeeklyDays(gel.getWeeklyDays())),
                        splitWeeklyDays(gel.getWeeklyDays()),
                        gel.getDuration(),
                        gel.getQuantity()
                )
        ));
        return result;
    }

    private List<SuspensionDTO> buildSuspensionDtos(Long prescriptionId) {
        List<SuspensionDTO> result = new ArrayList<>();
        suspensionRepository.findByPrescriptionId(prescriptionId).forEach(suspension -> result.add(
                new SuspensionDTO(
                        suspension.getName(),
                        suspension.getMorning(),
                        suspension.getAfternoon(),
                        suspension.getNight(),
                        resolveMedicineScheduleType(suspension.getScheduleType(), splitWeeklyDays(suspension.getWeeklyDays())),
                        splitWeeklyDays(suspension.getWeeklyDays()),
                        suspension.getIntakeType(),
                        suspension.getIntakeValue(),
                        suspension.getDuration(),
                        suspension.getQuantity()
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
        lotionRepository.deleteByPrescriptionId(prescriptionId);
        capsuleRepository.deleteByPrescriptionId(prescriptionId);
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

    /**
     * Convert S3 key to accessible URL if it's a key, otherwise return as-is if already a URL
     */
    private String convertS3KeyToUrl(String s3KeyOrUrl, S3Service.FileType fileType) {
        if (!hasText(s3KeyOrUrl)) {
            return null;
        }
        // If it's already a URL (starts with http or /), return as-is
        if (s3KeyOrUrl.startsWith("http://") || s3KeyOrUrl.startsWith("https://") || s3KeyOrUrl.startsWith("/")) {
            return s3KeyOrUrl;
        }
        // Otherwise, treat it as an S3 key and generate a URL
        try {
            return s3Service.generateUrl(s3KeyOrUrl, fileType);
        } catch (Exception e) {
            log.error("Failed to generate URL for key: {}", s3KeyOrUrl, e);
            return null;
        }
    }
}
