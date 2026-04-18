package com.escriptpro.medicine_service.util;

import com.escriptpro.medicine_service.entity.Medicine;
import com.escriptpro.medicine_service.entity.MedicineType;
import com.escriptpro.medicine_service.repository.MedicineRepository;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class MedicineDataLoader implements CommandLineRunner {

    private static final String CLEAN_DATA_FILE = "medicines_clean.csv";

    private final MedicineRepository medicineRepository;

    public MedicineDataLoader(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Override
    @CacheEvict(value = "medicineCache", allEntries = true)
    public void run(String... args) throws Exception {
        if (medicineRepository.count() == 0) {
            System.out.println("Medicine DB is empty - loading from CSV...");
            loadData();
            return;
        }

        // Detect missing medicine types and reload if needed
        boolean hasMissing = false;
        for (MedicineType type : MedicineType.values()) {
            List<Medicine> sample = medicineRepository.searchAutocompleteByType(
                    "", type, PageRequest.of(0, 1));
            if (sample.isEmpty()) {
                System.out.println("Missing type in DB: " + type);
                hasMissing = true;
            }
        }
        if (hasMissing) {
            System.out.println("Reloading CSV to add missing types...");
            medicineRepository.deleteAll();
            loadData();
        } else {
            System.out.println("Medicine DB up to date - all " + MedicineType.values().length + " types present.");
        }
    }

    public void loadData() throws IOException {
        ClassPathResource resource = new ClassPathResource(CLEAN_DATA_FILE);
        if (!resource.exists()) {
            return;
        }

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            if (line == null) {
                throw new IOException("Cleaned CSV is empty");
            }

            List<Medicine> batch = new ArrayList<>();
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;

                List<String> columns = parseCsvLine(line);
                if (columns.size() < 2) continue;

                Medicine medicine = new Medicine();
                medicine.setName(columns.get(0).trim());
                medicine.setType(MedicineType.valueOf(columns.get(1).trim()));
                batch.add(medicine);
            }
            medicineRepository.saveAll(batch);
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);

            if (ch == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                values.add(current.toString());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }

        values.add(current.toString());
        return values;
    }
}
