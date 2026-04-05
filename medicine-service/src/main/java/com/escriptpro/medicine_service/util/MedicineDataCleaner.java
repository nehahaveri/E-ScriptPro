package com.escriptpro.medicine_service.util;

import com.escriptpro.medicine_service.entity.MedicineType;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MedicineDataCleaner {

    private static final String INPUT_FILE = "raw_medicine.csv";
    private static final String OUTPUT_FILE = "medicines_clean.csv";

    public static void main(String[] args) {
        try {
            cleanData();
            System.out.println("Cleaned medicine dataset written to " + resolveOutputPath());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to clean medicine dataset", e);
        }
    }

    public static void cleanData() throws IOException {
        Path inputPath = resolveInputPath();
        Path outputPath = resolveOutputPath();

        try (BufferedReader reader = Files.newBufferedReader(inputPath, StandardCharsets.UTF_8);
             BufferedWriter writer = Files.newBufferedWriter(outputPath, StandardCharsets.UTF_8)) {

            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                throw new IOException("Input CSV is empty: " + inputPath);
            }

            Map<String, Integer> headerIndex = buildHeaderIndex(parseCsvLine(headerLine));
            Integer brandIndex = findColumnIndex(headerIndex, "brand_name", "name", "brand");
            Integer medicineNameIndex = findColumnIndex(
                    headerIndex,
                    "short_composition1",
                    "primary_ingredient",
                    "medicine_name",
                    "composition"
            );
            Integer typeIndex = findColumnIndex(
                    headerIndex,
                    "drug_form",
                    "medicine_form",
                    "dosage_form",
                    "type"
            );

            if (brandIndex == null || medicineNameIndex == null || typeIndex == null) {
                throw new IOException("Required columns not found in input CSV");
            }

            writer.write("brand,medicine_name,type");
            writer.newLine();

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }

                List<String> columns = parseCsvLine(line);
                String brand = getValue(columns, brandIndex).trim();
                String medicineName = getValue(columns, medicineNameIndex).trim();
                String type = normalizeType(getValue(columns, typeIndex));

                if (isMissingValue(brand) || isMissingValue(medicineName) || type == null) {
                    continue;
                }

                writer.write(toCsvField(brand));
                writer.write(",");
                writer.write(toCsvField(medicineName));
                writer.write(",");
                writer.write(toCsvField(type));
                writer.newLine();
            }
        }
    }

    public static void clean() throws IOException {
        cleanData();
    }

    private static Path resolveInputPath() {
        return resolveResourcePath(INPUT_FILE);
    }

    private static Path resolveOutputPath() {
        return resolveResourcePath(OUTPUT_FILE);
    }

    private static Path resolveResourcePath(String fileName) {
        Path directPath = Path.of("src/main/resources", fileName);
        if (Files.exists(directPath) || directPath.getParent().toFile().exists()) {
            return directPath;
        }

        Path modulePath = Path.of("medicine-service", "src", "main", "resources", fileName);
        if (Files.exists(modulePath) || modulePath.getParent().toFile().exists()) {
            return modulePath;
        }

        return directPath;
    }

    private static Map<String, Integer> buildHeaderIndex(List<String> headers) {
        Map<String, Integer> headerIndex = new HashMap<>();
        for (int i = 0; i < headers.size(); i++) {
            headerIndex.put(headers.get(i).trim().toLowerCase(), i);
        }
        return headerIndex;
    }

    private static Integer findColumnIndex(Map<String, Integer> headerIndex, String... candidates) {
        for (String candidate : candidates) {
            Integer index = headerIndex.get(candidate.toLowerCase());
            if (index != null) {
                return index;
            }
        }
        return null;
    }

    private static String getValue(List<String> columns, int index) {
        return index < columns.size() ? columns.get(index) : "";
    }

    private static String normalizeType(String rawType) {
        String normalized = rawType == null ? "" : rawType.trim().toLowerCase();

        if (isMissingValue(normalized)) {
            return null;
        }
        if (normalized.contains("tablet") || normalized.contains("capsule")) {
            return MedicineType.TABLET.name();
        }
        if (normalized.contains("syrup") || normalized.contains("suspension")) {
            return MedicineType.SYRUP.name();
        }
        if (normalized.contains("injection") || normalized.contains("inject")) {
            return MedicineType.INJECTION.name();
        }
        return null;
    }

    private static boolean isMissingValue(String value) {
        if (value == null) {
            return true;
        }

        String normalized = value.trim();
        return normalized.isEmpty() || normalized.equalsIgnoreCase("null");
    }

    private static List<String> parseCsvLine(String line) {
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

    private static String toCsvField(String value) {
        String escaped = value.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
