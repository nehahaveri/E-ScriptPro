package com.escriptpro.pdf_service.controller;

import com.escriptpro.pdf_service.dto.PrescriptionRequestDTO;
import com.escriptpro.pdf_service.service.PdfService;
import com.escriptpro.pdf_service.service.PdfStorageService;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pdf")
public class PdfController {

    private final PdfService pdfService;
    private final PdfStorageService pdfStorageService;

    public PdfController(PdfService pdfService, PdfStorageService pdfStorageService) {
        this.pdfService = pdfService;
        this.pdfStorageService = pdfStorageService;
    }

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestBody PrescriptionRequestDTO request) {
        byte[] pdfBytes = pdfService.generatePrescriptionPdf(request);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.attachment().filename("prescription.pdf").build());

        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<byte[]> getPdfByPrescription(@PathVariable Long prescriptionId) {
        byte[] pdfBytes = pdfStorageService.retrieveByPrescriptionId(prescriptionId);
        if (pdfBytes == null) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename("prescription-" + prescriptionId + ".pdf").build());
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }

    @GetMapping("/file/{filename}")
    public ResponseEntity<byte[]> getPdfByFilename(@PathVariable String filename) {
        byte[] pdfBytes = pdfStorageService.retrieve(filename);
        if (pdfBytes == null) {
            return ResponseEntity.notFound().build();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.inline().filename(filename).build());
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
