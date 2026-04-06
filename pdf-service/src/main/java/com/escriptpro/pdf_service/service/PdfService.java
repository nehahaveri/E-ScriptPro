package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.dto.InjectionDTO;
import com.escriptpro.pdf_service.dto.PrescriptionRequestDTO;
import com.escriptpro.pdf_service.dto.SyrupDTO;
import com.escriptpro.pdf_service.dto.TabletDTO;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PdfService {

    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 12, Font.BOLD);

    public byte[] generatePrescriptionPdf(PrescriptionRequestDTO request) {
        Document document = new Document();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, outputStream);
            document.open();

            document.add(new Paragraph("E-ScriptPro"));
            document.add(new Paragraph("Doctor Name: " + safe(request.getDoctorName())));
            document.add(new Paragraph("Clinic: " + safe(request.getClinicName())));
            document.add(new Paragraph("Locality: " + safe(request.getLocality())));
            document.add(new Paragraph("Education: " + safe(request.getEducation())));
            addOptionalImage(document, request.getLogoUrl(), 120f, 50f, "Logo");
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Patient ID: " + safe(request.getPatientId())));
            document.add(new Paragraph("Diagnosis: " + safe(request.getDiagnosis())));
            document.add(new Paragraph(" "));

            List<String[]> tabletRows = new ArrayList<>();
            if (request.getTablets() != null && !request.getTablets().isEmpty()) {
                for (TabletDTO tablet : request.getTablets()) {
                    tabletRows.add(new String[]{
                            safe(tablet.getBrand()) + " " + safe(tablet.getMedicineName()),
                            timingString(tablet.getMorning(), tablet.getAfternoon(), tablet.getNight()),
                            safe(tablet.getDuration())
                    });
                }
            }
            addMedicineTable(document, "Tablets", tabletRows);

            List<String[]> syrupRows = new ArrayList<>();
            if (request.getSyrups() != null && !request.getSyrups().isEmpty()) {
                for (SyrupDTO syrup : request.getSyrups()) {
                    syrupRows.add(new String[]{
                            safe(syrup.getBrand()) + " " + safe(syrup.getSyrupName()),
                            timingString(syrup.getMorning(), syrup.getAfternoon(), syrup.getNight()),
                            safe(syrup.getDuration())
                    });
                }
            }
            addMedicineTable(document, "Syrups", syrupRows);

            List<String[]> injectionRows = new ArrayList<>();
            if (request.getInjections() != null && !request.getInjections().isEmpty()) {
                for (InjectionDTO injection : request.getInjections()) {
                    injectionRows.add(new String[]{
                            safe(injection.getBrand()) + " " + safe(injection.getMedicineName()),
                            injectionSchedule(injection),
                            "-"
                    });
                }
            }
            addMedicineTable(document, "Injections", injectionRows);

            document.add(new Paragraph("Advice: " + safe(request.getAdvice())));
            document.add(new Paragraph("Consultation Fee: " + safe(request.getConsultationFee())));
            addOptionalImage(document, request.getSignatureUrl(), 120f, 40f, "Signature");

        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate prescription PDF", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return outputStream.toByteArray();
    }

    private void addMedicineTable(Document document, String title, List<String[]> rows) throws DocumentException {
        document.add(new Paragraph(title + ":", SECTION_FONT));

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setSpacingBefore(6f);
        table.setSpacingAfter(10f);

        addHeaderCell(table, "Medicine");
        addHeaderCell(table, "Timing");
        addHeaderCell(table, "Duration");

        if (rows == null || rows.isEmpty()) {
            addBodyCell(table, "None");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
        } else {
            for (String[] row : rows) {
                addBodyCell(table, safe(row[0]));
                addBodyCell(table, safe(row[1]));
                addBodyCell(table, safe(row[2]));
            }
        }

        document.add(table);
    }

    private void addHeaderCell(PdfPTable table, String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value));
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String value) {
        table.addCell(new Phrase(value));
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

    private void addOptionalImage(Document document, String imageUrl, float maxWidth, float maxHeight, String label)
            throws DocumentException {
        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }
        try {
            Image image = Image.getInstance(new URL(imageUrl));
            image.scaleToFit(maxWidth, maxHeight);
            document.add(new Paragraph(label + ":"));
            document.add(image);
        } catch (Exception ex) {
            document.add(new Paragraph(label + " URL: " + imageUrl));
        }
    }
}
