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
            String line = reader.readLine(); // skip header
            if (line == null) {
                throw new IOException("Cleaned CSV is empty");
            }

            List<Medicine> batch = new ArrayList<>();
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) continue;

                List<String> columns = parseCsvLine(line);
                if (columns.size() < 2) continue;

                String name = unquote(columns.get(0).trim());
                String typeStr = unquote(columns.get(1).trim());

                MedicineType type;
                try {
                    type = MedicineType.valueOf(typeStr.toUpperCase());
                } catch (IllegalArgumentException e) {
                    continue; // skip unknown types
                }

                Medicine medicine = new Medicine();
                medicine.setName(name);
                medicine.setType(type);
                medicine.setGeneric_name("");
                medicine.setStrength("");
                batch.add(medicine);

                if (batch.size() >= 1000) {
                    medicineRepository.saveAll(batch);
                    batch.clear();
                }
            }
            if (!batch.isEmpty()) {
                medicineRepository.saveAll(batch);
            }
            System.out.println("Medicine data loaded successfully.");
        }
    }

    private String unquote(String value) {
        if (value == null) return null;
        if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
            return value.substring(1, value.length() - 1).replace("\"\"", "\"");
        }
        return value;
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
