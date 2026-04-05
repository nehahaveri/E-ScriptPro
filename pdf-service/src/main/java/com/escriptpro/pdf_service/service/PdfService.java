package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.dto.InjectionDTO;
import com.escriptpro.pdf_service.dto.PrescriptionRequestDTO;
import com.escriptpro.pdf_service.dto.SyrupDTO;
import com.escriptpro.pdf_service.dto.TabletDTO;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import org.springframework.stereotype.Service;

@Service
public class PdfService {

    private static final String DOCTOR_NAME = "Doctor Name: Dr. John Doe";

    public byte[] generatePrescriptionPdf(PrescriptionRequestDTO request) {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph("E-ScriptPro"));
            document.add(new Paragraph(DOCTOR_NAME));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Patient ID: " + safe(request.getPatientId())));
            document.add(new Paragraph("Diagnosis: " + safe(request.getDiagnosis())));
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Tablets:"));
            if (request.getTablets() != null && !request.getTablets().isEmpty()) {
                for (TabletDTO tablet : request.getTablets()) {
                    document.add(new Paragraph("- " + safe(tablet.getBrand()) + " " + safe(tablet.getMedicineName())));
                    document.add(new Paragraph("  timing: " + timingString(tablet.getMorning(), tablet.getAfternoon(), tablet.getNight())));
                    document.add(new Paragraph("  duration: " + safe(tablet.getDuration())));
                }
            } else {
                document.add(new Paragraph("- None"));
            }
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Syrups:"));
            if (request.getSyrups() != null && !request.getSyrups().isEmpty()) {
                for (SyrupDTO syrup : request.getSyrups()) {
                    document.add(new Paragraph("- " + safe(syrup.getBrand()) + " " + safe(syrup.getSyrupName())));
                    document.add(new Paragraph("  timing: " + timingString(syrup.getMorning(), syrup.getAfternoon(), syrup.getNight())));
                    document.add(new Paragraph("  duration: " + safe(syrup.getDuration())));
                }
            } else {
                document.add(new Paragraph("- None"));
            }
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Injections:"));
            if (request.getInjections() != null && !request.getInjections().isEmpty()) {
                for (InjectionDTO injection : request.getInjections()) {
                    document.add(new Paragraph("- schedule: " + injectionSchedule(injection)));
                }
            } else {
                document.add(new Paragraph("- None"));
            }
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Advice: " + safe(request.getAdvice())));
            document.add(new Paragraph("Consultation Fee: " + safe(request.getConsultationFee())));

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate prescription PDF", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return outputStream.toByteArray();
    }

    private String safe(Object value) {
        return value == null ? "-" : value.toString();
    }

    private String timingString(Boolean morning, Boolean afternoon, Boolean night) {
        StringBuilder timings = new StringBuilder();
        if (Boolean.TRUE.equals(morning)) {
            timings.append("morning");
        }
        if (Boolean.TRUE.equals(afternoon)) {
            if (!timings.isEmpty()) {
                timings.append("/");
            }
            timings.append("afternoon");
        }
        if (Boolean.TRUE.equals(night)) {
            if (!timings.isEmpty()) {
                timings.append("/");
            }
            timings.append("night");
        }
        return timings.isEmpty() ? "-" : timings.toString();
    }

    private String injectionSchedule(InjectionDTO injection) {
        if (injection == null) {
            return "-";
        }
        if (Boolean.TRUE.equals(injection.getDaily())) {
            return "daily";
        }
        if (Boolean.TRUE.equals(injection.getAlternateDay())) {
            return "alternate day";
        }
        if (Boolean.TRUE.equals(injection.getWeeklyOnce())) {
            return "weekly once";
        }
        return "-";
    }
}
