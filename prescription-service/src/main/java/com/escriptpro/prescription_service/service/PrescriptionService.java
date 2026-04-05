package com.escriptpro.prescription_service.service;

import com.escriptpro.prescription_service.client.DoctorClient;
import com.escriptpro.prescription_service.client.MedicineClient;
import com.escriptpro.prescription_service.client.PatientClient;
import com.escriptpro.prescription_service.client.PdfClient;
import com.escriptpro.prescription_service.dto.PrescriptionRequestDTO;
import com.escriptpro.prescription_service.entity.Injection;
import com.escriptpro.prescription_service.entity.Prescription;
import com.escriptpro.prescription_service.entity.Syrup;
import com.escriptpro.prescription_service.entity.Tablet;
import com.escriptpro.prescription_service.repository.InjectionRepository;
import com.escriptpro.prescription_service.repository.PrescriptionRepository;
import com.escriptpro.prescription_service.repository.SyrupRepository;
import com.escriptpro.prescription_service.repository.TabletRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

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
    }

    public byte[] createPrescription(PrescriptionRequestDTO request, String email, String token) {
        Long doctorId = doctorClient.getDoctorIdByEmail(email, token);
        validatePatientOwnership(request.getPatientId(), token);

        Prescription prescription = new Prescription();
        prescription.setDoctorId(doctorId);
        prescription.setPatientId(request.getPatientId());
        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setAdvice(request.getAdvice());
        prescription.setConsultationFee(request.getConsultationFee());
        prescription.setVisitDate(LocalDate.now());

        Prescription savedPrescription = prescriptionRepository.save(prescription);
        kafkaProducerService.sendPrescriptionEvent(request);

        if (request.getTablets() != null) {
            request.getTablets().forEach(tabletDTO -> {
                softValidateMedicine(tabletDTO.getMedicineName(), "TABLET");

                Tablet tablet = new Tablet();
                tablet.setPrescription(savedPrescription);
                tablet.setBrand(tabletDTO.getBrand());
                tablet.setMedicineName(tabletDTO.getMedicineName());
                tablet.setMorning(tabletDTO.getMorning());
                tablet.setAfternoon(tabletDTO.getAfternoon());
                tablet.setNight(tabletDTO.getNight());
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
                softValidateMedicine(syrupDTO.getSyrupName(), "SYRUP");

                Syrup syrup = new Syrup();
                syrup.setPrescription(savedPrescription);
                syrup.setBrand(syrupDTO.getBrand());
                syrup.setSyrupName(syrupDTO.getSyrupName());
                syrup.setMorning(syrupDTO.getMorning());
                syrup.setAfternoon(syrupDTO.getAfternoon());
                syrup.setNight(syrupDTO.getNight());
                syrup.setDuration(syrupDTO.getDuration());
                syrup.setQuantity(syrupDTO.getQuantity());
                syrupRepository.save(syrup);
            });
        }

        if (request.getInjections() != null) {
            request.getInjections().forEach(injectionDTO -> {
                softValidateMedicine(injectionDTO.getMedicineName(), "INJECTION");

                Injection injection = new Injection();
                injection.setPrescription(savedPrescription);
                injection.setBrand(injectionDTO.getBrand());
                injection.setMedicineName(injectionDTO.getMedicineName());
                injection.setDaily(injectionDTO.getDaily());
                injection.setAlternateDay(injectionDTO.getAlternateDay());
                injection.setWeeklyOnce(injectionDTO.getWeeklyOnce());
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

    private void softValidateMedicine(String query, String type) {
        if (query == null || query.isBlank()) {
            return;
        }

        try {
            List<Map<String, Object>> medicines = medicineClient.searchMedicines(query, type);
            if (medicines == null || medicines.isEmpty()) {
                log.warn("No medicine match found for query '{}' and type '{}'. Saving anyway.", query, type);
            }
        } catch (Exception e) {
            log.warn("Medicine lookup failed for query '{}' and type '{}'. Saving anyway.", query, type, e);
        }
    }

    private void validatePatientOwnership(Long patientId, String token) {
        patientClient.getPatientById(patientId, token);
    }
}
