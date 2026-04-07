package com.escriptpro.pdf_service.service;

import com.escriptpro.pdf_service.dto.InjectionDTO;
import com.escriptpro.pdf_service.dto.PrescriptionRequestDTO;
import com.escriptpro.pdf_service.dto.SyrupDTO;
import com.escriptpro.pdf_service.dto.TabletDTO;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PdfService {

    private static final java.awt.Color DARK_GREY = new java.awt.Color(76, 76, 76);
    private static final java.awt.Color MID_GREY = new java.awt.Color(114, 114, 114);
    private static final java.awt.Color LIGHT_GREY = new java.awt.Color(245, 245, 245);
    private static final java.awt.Color BORDER = new java.awt.Color(196, 196, 196);

    private static final Font TITLE = new Font(Font.HELVETICA, 16, Font.BOLD, DARK_GREY);
    private static final Font SECTION_TITLE = new Font(Font.HELVETICA, 10, Font.BOLD, DARK_GREY);
    private static final Font SUBTITLE = new Font(Font.HELVETICA, 9, Font.BOLD, MID_GREY);
    private static final Font TEXT_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, DARK_GREY);
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 8, Font.BOLD, MID_GREY);
    private static final Font RX_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, MID_GREY);
    private static final Font TABLE_HEADER = new Font(Font.HELVETICA, 5.8f, Font.BOLD, java.awt.Color.WHITE);
    private static final Font TABLE_BODY = new Font(Font.HELVETICA, 7, Font.NORMAL, DARK_GREY);
    private static final Font TABLE_BODY_BOLD = new Font(Font.HELVETICA, 7, Font.BOLD, DARK_GREY);
    private static final Font TICK_FONT = new Font(Font.ZAPFDINGBATS, 9, Font.NORMAL, DARK_GREY);
    private static final String TICK_MARKER = "__TICK__";
    private static final String CROSS_MARKER = "__CROSS__";

    public byte[] generatePrescriptionPdf(PrescriptionRequestDTO request) {
        Document document = new Document(PageSize.A5, 18f, 18f, 18f, 20f);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, outputStream);
            document.open();

            drawPageBackground(writer);
            addHeader(document, request);
            addPatientLine(document, request);
            addRxTable(document, request);
            addFooter(document, request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate prescription PDF", e);
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return outputStream.toByteArray();
    }

    private void drawPageBackground(PdfWriter writer) {
        Rectangle page = writer.getPageSize();
        PdfContentByte canvas = writer.getDirectContentUnder();
        canvas.setColorFill(java.awt.Color.WHITE);
        canvas.rectangle(0, 0, page.getWidth(), page.getHeight());
        canvas.fill();
    }

    private void addHeader(Document document, PrescriptionRequestDTO request) throws DocumentException {
        boolean showDoctorDetails = shouldShowDoctorDetails(request);
        if (!showDoctorDetails) {
            return;
        }
        PdfPTable table = new PdfPTable(new float[]{1.05f, 2.15f, 2.1f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(6f);

        PdfPCell logoCell = blankCell();
        logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        Image logo = loadImage(request.getLogoUrl(), 54f, 54f);
        if (logo != null) {
            logoCell.addElement(logo);
        } else {
            Paragraph rx = new Paragraph("Rx", RX_FONT);
            rx.setAlignment(Element.ALIGN_CENTER);
            logoCell.addElement(rx);
        }
        table.addCell(logoCell);

        PdfPCell doctorCell = blankCell();
        doctorCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        if (showDoctorDetails && hasText(request.getDoctorName())) {
            Paragraph doctor = new Paragraph(request.getDoctorName().trim(), TITLE);
            doctor.setLeading(16f);
            doctorCell.addElement(doctor);
        }
        if (showDoctorDetails && hasText(request.getEducation())) {
            Paragraph education = new Paragraph(request.getEducation().trim(), SUBTITLE);
            education.setLeading(11f);
            doctorCell.addElement(education);
        }
        table.addCell(doctorCell);
        
        PdfPCell contactCell = blankCell();
        contactCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        contactCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        if (showDoctorDetails && hasText(request.getClinicName())) {
            Paragraph clinic = new Paragraph(request.getClinicName().trim(), SECTION_TITLE);
            clinic.setAlignment(Element.ALIGN_RIGHT);
            clinic.setLeading(12f);
            contactCell.addElement(clinic);
        }
        if (showDoctorDetails) {
            addHeaderLine(contactCell, request.getLocality(), Element.ALIGN_RIGHT);
            addHeaderLine(contactCell, request.getDoctorEmail(), Element.ALIGN_RIGHT);
            addHeaderLine(contactCell, request.getDoctorPhone(), Element.ALIGN_RIGHT);
        }
        table.addCell(contactCell);

        document.add(table);

        PdfPTable dividerTable = new PdfPTable(1);
        dividerTable.setWidthPercentage(100);
        dividerTable.setSpacingAfter(8f);
        PdfPCell divider = new PdfPCell();
        divider.setBorder(Rectangle.BOTTOM);
        divider.setBorderColor(BORDER);
        divider.setFixedHeight(4f);
        divider.setPadding(0f);
        divider.setBackgroundColor(java.awt.Color.WHITE);
        dividerTable.addCell(divider);
        document.add(dividerTable);
    }

    private void addPatientLine(Document document, PrescriptionRequestDTO request) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{3.5f, 1f, 1f, 1.5f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(8f);

        addPatientCell(table, "Name", firstNonBlank(request.getPatientName(), patientLabel(request.getPatientId())));
        addPatientCell(table, "Age", request.getPatientAge() != null ? request.getPatientAge().toString() : null);
        addPatientCell(table, "Sex", request.getPatientGender());
        addPatientCell(table, "Date", request.getVisitDate());

        document.add(table);
    }

    private void addRxTable(Document document, PrescriptionRequestDTO request) throws DocumentException {
        Paragraph rx = new Paragraph("Rx", RX_FONT);
        rx.setSpacingAfter(4f);
        document.add(rx);

        PdfPTable table = new PdfPTable(new float[]{0.42f, 1.92f, 1.02f, 1.18f, 0.84f, 1.22f, 0.78f, 0.62f});
        table.setWidthPercentage(100);
        table.setSpacingAfter(6f);

        addHeaderCell(table, "No.");
        addHeaderCell(table, "Medication Name");
        addHeaderCell(table, "Morning");
        addHeaderCell(table, "Afternoon");
        addHeaderCell(table, "Night");
        addHeaderCell(table, "Notes");
        addHeaderCell(table, "Days");
        addHeaderCell(table, "Qty");

        List<MedicationRow> rows = buildMedicationRows(request);
        if (rows.isEmpty()) {
            addBodyCell(table, "1");
            addBodyCell(table, "No medications added");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
            addBodyCell(table, "-");
        } else {
            for (int i = 0; i < rows.size(); i++) {
                MedicationRow row = rows.get(i);
                addBodyCell(table, String.valueOf(i + 1));
                addBodyCell(table, row.medicationName);
                addTimingCell(table, row.morning);
                addTimingCell(table, row.afternoon);
                addTimingCell(table, row.night);
                addBodyCell(table, row.additionalInformation);
                addBodyCell(table, row.days);
                addBodyCell(table, row.quantity);
            }
        }

        document.add(table);
        addFollowUpSection(document, request);
    }

    private void addFollowUpSection(Document document, PrescriptionRequestDTO request) throws DocumentException {
        if (!hasText(request.getFollowUpDate())) {
            return;
        }

        Paragraph followUp = new Paragraph();
        followUp.setSpacingAfter(10f);
        followUp.add(new Phrase("Next Follow-Up Date: ", LABEL_FONT));
        followUp.add(new Phrase(request.getFollowUpDate().trim(), TEXT_FONT));
        document.add(followUp);
    }

    private void addFooter(Document document, PrescriptionRequestDTO request) throws DocumentException {
        boolean showDoctorDetails = shouldShowDoctorDetails(request);
        PdfPTable footer = new PdfPTable(1);
        footer.setWidthPercentage(100);

        PdfPCell footerCell = blankCell();
        footerCell.setPaddingTop(6f);
        footerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        if (request.getConsultationFee() != null) {
            Paragraph fee = new Paragraph();
            fee.setSpacingAfter(6f);
            fee.setAlignment(Element.ALIGN_RIGHT);
            fee.add(new Phrase("Consultation Fee: ", LABEL_FONT));
            fee.add(new Phrase(String.valueOf(request.getConsultationFee()), TEXT_FONT));
            footerCell.addElement(fee);
        }

        Image signature = showDoctorDetails ? loadImage(request.getSignatureUrl(), 92f, 34f) : null;
        if (signature != null) {
            signature.setAlignment(Element.ALIGN_RIGHT);
            footerCell.addElement(signature);
        }

        footer.addCell(footerCell);
        document.add(footer);
    }

    private void addPatientCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(BORDER);
        cell.setPaddingBottom(4f);
        Phrase phrase = new Phrase();
        phrase.add(new Phrase(label + ": ", LABEL_FONT));
        phrase.add(new Phrase(defaultText(value, " "), TEXT_FONT));
        cell.setPhrase(phrase);
        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String value) {
        PdfPCell cell = new PdfPCell(new Phrase(value, TABLE_HEADER));
        cell.setBackgroundColor(DARK_GREY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(BORDER);
        cell.setPadding(5f);
        table.addCell(cell);
    }

    private void addBodyCell(PdfPTable table, String value) {
        if (TICK_MARKER.equals(value)) {
            addBodyCell(table, "4", Element.ALIGN_CENTER, TICK_FONT);
            return;
        }
        if (CROSS_MARKER.equals(value)) {
            addBodyCell(table, "X", Element.ALIGN_CENTER, TABLE_BODY_BOLD);
            return;
        }
        addBodyCell(table, value, Element.ALIGN_LEFT, TABLE_BODY);
    }

    private void addTimingCell(PdfPTable table, String value) {
        if (TICK_MARKER.equals(value)) {
            addBodyCell(table, "4", Element.ALIGN_CENTER, TICK_FONT);
            return;
        }
        if (CROSS_MARKER.equals(value)) {
            addBodyCell(table, "X", Element.ALIGN_CENTER, TABLE_BODY_BOLD);
            return;
        }
        addBodyCell(table, value, Element.ALIGN_CENTER, TABLE_BODY_BOLD);
    }

    private void addBodyCell(PdfPTable table, String value, int horizontalAlignment, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(defaultText(value, "-"), font));
        cell.setBorderColor(BORDER);
        cell.setPadding(5f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setHorizontalAlignment(horizontalAlignment);
        table.addCell(cell);
    }

    private PdfPCell blankCell() {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        return cell;
    }

    private void addHeaderLine(PdfPCell cell, String value, int alignment) {
        if (!hasText(value)) {
            return;
        }
        Paragraph line = new Paragraph(value.trim(), TEXT_FONT);
        line.setLeading(10f);
        line.setAlignment(alignment);
        cell.addElement(line);
    }

    private List<MedicationRow> buildMedicationRows(PrescriptionRequestDTO request) {
        List<MedicationRow> rows = new ArrayList<>();

        if (request.getTablets() != null) {
            for (TabletDTO tablet : request.getTablets()) {
                List<String> instructions = new ArrayList<>();
                if (Boolean.TRUE.equals(tablet.getWithWater())) {
                    instructions.add("With water");
                } else if (tablet.getWithWater() != null) {
                    instructions.add("Without water");
                }
                if (Boolean.TRUE.equals(tablet.getChew())) {
                    instructions.add("Chew");
                }
                if (hasText(tablet.getInstruction())) {
                    instructions.add(formatInstruction(tablet.getInstruction()));
                }
                appendWeeklyDays(instructions, tablet.getScheduleType(), tablet.getWeeklyDays());

                rows.add(new MedicationRow(
                        uppercase(joinNonBlank(" - ", "Tablet", joinNonBlank(" ", tablet.getBrand(), tablet.getMedicineName()))),
                        mark(tablet.getMorning()),
                        mark(tablet.getAfternoon()),
                        mark(tablet.getNight()),
                        joinNonBlank(", ", instructions.toArray(new String[0])),
                        formatMedicationDuration(tablet.getDuration(), tablet.getScheduleType()),
                        tablet.getQuantity() != null ? tablet.getQuantity().toString() : "-"
                ));
            }
        }

        if (request.getSyrups() != null) {
            for (SyrupDTO syrup : request.getSyrups()) {
                rows.add(new MedicationRow(
                        uppercase(joinNonBlank(" - ", "Syrup", joinNonBlank(" ", syrup.getBrand(), syrup.getSyrupName()))),
                        mark(syrup.getMorning()),
                        mark(syrup.getAfternoon()),
                        mark(syrup.getNight()),
                        syrupNotes(syrup),
                        formatMedicationDuration(syrup.getDuration(), syrup.getScheduleType()),
                        syrup.getQuantity() != null ? syrup.getQuantity() + " ml" : "-"
                ));
            }
        }

        if (request.getInjections() != null) {
            for (InjectionDTO injection : request.getInjections()) {
                rows.add(new MedicationRow(
                        uppercase(joinNonBlank(" - ", "Injection", joinNonBlank(" ", injection.getBrand(), injection.getMedicineName()))),
                        "-",
                        "-",
                        "-",
                        injectionNotes(injection),
                        injectionSchedule(injection),
                        "-"
                ));
            }
        }

        return rows;
    }

    private Image loadImage(String imageUrl, float maxWidth, float maxHeight) {
        if (!hasText(imageUrl)) {
            return null;
        }
        try {
            Image image = Image.getInstance(new URL(imageUrl));
            image.scaleToFit(maxWidth, maxHeight);
            return image;
        } catch (Exception ignored) {
            return null;
        }
    }

    private String formatInstruction(String instruction) {
        String normalized = instruction.replace('_', ' ').toLowerCase();
        if (normalized.isEmpty()) {
            return normalized;
        }
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private String injectionSchedule(InjectionDTO injection) {
        if (injection == null) {
            return "-";
        }
        if (hasText(injection.getScheduleType())) {
            String normalized = injection.getScheduleType().trim().toUpperCase();
            if ("WEEKLY".equals(normalized)) {
                return "Weekly";
            }
            if ("DAILY".equals(normalized)) {
                return "Daily";
            }
            if ("ALTERNATE_DAY".equals(normalized)) {
                return "Alternate day";
            }
        }
        if (Boolean.TRUE.equals(injection.getWeeklyOnce())) {
            return "Weekly once";
        }
        if (Boolean.TRUE.equals(injection.getAlternateDay())) {
            return "Alternate day";
        }
        if (Boolean.TRUE.equals(injection.getDaily())) {
            return "Daily";
        }
        return "-";
    }

    private String injectionNotes(InjectionDTO injection) {
        if (injection == null) {
            return "-";
        }
        List<String> notes = new ArrayList<>();
        if (injection.getWeeklyDays() != null && !injection.getWeeklyDays().isEmpty()) {
            String weeklyDays = injection.getWeeklyDays().stream()
                    .filter(this::hasText)
                    .map(this::formatDay)
                    .collect(Collectors.joining(", "));
            if (hasText(weeklyDays)) {
                notes.add("Weekly on: " + weeklyDays);
            }
        }
        return notes.isEmpty() ? "-" : String.join(" | ", notes);
    }

    private String syrupNotes(SyrupDTO syrup) {
        if (syrup == null) {
            return "-";
        }
        List<String> notes = new ArrayList<>();
        if (Boolean.TRUE.equals(syrup.getMorning())) {
            notes.add("Morning");
        }
        if (Boolean.TRUE.equals(syrup.getAfternoon())) {
            notes.add("Afternoon");
        }
        if (Boolean.TRUE.equals(syrup.getNight())) {
            notes.add("Night");
        }
        appendWeeklyDays(notes, syrup.getScheduleType(), syrup.getWeeklyDays());
        return notes.isEmpty() ? "-" : String.join(", ", notes);
    }

    private String formatMedicationDuration(Integer duration, String scheduleType) {
        if (duration == null) {
            return "WEEKLY".equalsIgnoreCase(scheduleType) ? "Weekly" : "Daily";
        }
        return duration + ("WEEKLY".equalsIgnoreCase(scheduleType) ? " week(s)" : " day(s)");
    }

    private void appendWeeklyDays(List<String> notes, String scheduleType, List<String> weeklyDays) {
        if (!"WEEKLY".equalsIgnoreCase(scheduleType) || weeklyDays == null || weeklyDays.isEmpty()) {
            return;
        }
        String formattedDays = weeklyDays.stream()
                .filter(this::hasText)
                .map(this::formatDay)
                .collect(Collectors.joining(", "));
        if (hasText(formattedDays)) {
            notes.add("Weekly on: " + formattedDays);
        }
    }

    private String formatDay(String day) {
        String normalized = day.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return normalized;
        }
        return Character.toUpperCase(normalized.charAt(0)) + normalized.substring(1);
    }

    private String patientLabel(Long patientId) {
        return patientId == null ? null : "Patient ID " + patientId;
    }

    private String mark(Boolean value) {
        return Boolean.TRUE.equals(value) ? TICK_MARKER : CROSS_MARKER;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private boolean isVisible(Boolean value, boolean defaultValue) {
        return value != null ? value : defaultValue;
    }

    private boolean shouldShowDoctorDetails(PrescriptionRequestDTO request) {
        if (request == null) {
            return true;
        }
        return isVisible(request.getShowDoctorName(), true) && isVisible(request.getShowClinicName(), true);
    }

    private String defaultText(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private String uppercase(String value) {
        return value == null ? null : value.toUpperCase();
    }

    private String firstNonBlank(String first, String second) {
        return hasText(first) ? first.trim() : hasText(second) ? second.trim() : null;
    }

    private String joinNonBlank(String separator, String... values) {
        List<String> parts = new ArrayList<>();
        for (String value : values) {
            if (hasText(value)) {
                parts.add(value.trim());
            }
        }
        return parts.isEmpty() ? null : String.join(separator, parts);
    }

    private static class MedicationRow {
        private final String medicationName;
        private final String morning;
        private final String afternoon;
        private final String night;
        private final String additionalInformation;
        private final String days;
        private final String quantity;

        private MedicationRow(
                String medicationName,
                String morning,
                String afternoon,
                String night,
                String additionalInformation,
                String days,
                String quantity) {
            this.medicationName = medicationName;
            this.morning = morning;
            this.afternoon = afternoon;
            this.night = night;
            this.additionalInformation = additionalInformation;
            this.days = days;
            this.quantity = quantity;
        }
    }
}
