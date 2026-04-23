package com.escriptpro.patient_service.service;

import com.escriptpro.patient_service.dto.DoctorResponseDTO;
import com.escriptpro.patient_service.dto.GoogleCalendarConnectResponseDTO;
import com.escriptpro.patient_service.dto.GoogleCalendarConnectionStatusDTO;
import com.escriptpro.patient_service.dto.GoogleCalendarSyncResponseDTO;
import com.escriptpro.patient_service.entity.GoogleCalendarConnection;
import com.escriptpro.patient_service.entity.GoogleCalendarOAuthState;
import com.escriptpro.patient_service.entity.Patient;
import com.escriptpro.patient_service.repository.GoogleCalendarConnectionRepository;
import com.escriptpro.patient_service.repository.GoogleCalendarOAuthStateRepository;
import com.escriptpro.patient_service.repository.PatientRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class GoogleCalendarOAuthService {

    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final String GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
    private static final DateTimeFormatter GOOGLE_EVENT_TIME_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final String GOOGLE_SCOPES = "openid email profile https://www.googleapis.com/auth/calendar.events";

    private final GoogleCalendarConnectionRepository connectionRepository;
    private final GoogleCalendarOAuthStateRepository stateRepository;
    private final PatientRepository patientRepository;
    private final RestTemplate restTemplate;

    @Value("${google.calendar.client-id:}")
    private String clientId;

    @Value("${google.calendar.client-secret:}")
    private String clientSecret;

    @Value("${google.calendar.redirect-uri:http://localhost:8082/calendar/google/callback}")
    private String redirectUri;

    @Value("${google.calendar.default-post-connect-redirect:http://localhost:5173/dashboard?googleCalendar=connected}")
    private String defaultPostConnectRedirect;

    @Value("${services.doctor-service.url:http://localhost:8086}")
    private String doctorServiceUrl;

    public GoogleCalendarOAuthService(
            GoogleCalendarConnectionRepository connectionRepository,
            GoogleCalendarOAuthStateRepository stateRepository,
            PatientRepository patientRepository,
            RestTemplate restTemplate) {
        this.connectionRepository = connectionRepository;
        this.stateRepository = stateRepository;
        this.patientRepository = patientRepository;
        this.restTemplate = restTemplate;
    }

    public GoogleCalendarConnectResponseDTO buildAuthorizationUrl(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            String requestedRedirectUri) {
        requireOAuthConfigured();
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        stateRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        String stateToken = UUID.randomUUID().toString();
        GoogleCalendarOAuthState oauthState = new GoogleCalendarOAuthState();
        oauthState.setStateToken(stateToken);
        oauthState.setDoctorId(doctorId);
        oauthState.setDoctorEmail(email);
        oauthState.setRedirectUri(sanitizeRedirectUri(requestedRedirectUri));
        oauthState.setCreatedAt(LocalDateTime.now());
        oauthState.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        stateRepository.save(oauthState);

        String authorizationUrl = UriComponentsBuilder.fromUriString(GOOGLE_AUTH_URL)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", GOOGLE_SCOPES)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", stateToken)
                .build(true)
                .toUriString();

        return new GoogleCalendarConnectResponseDTO(authorizationUrl, stateToken);
    }

    public String handleCallback(String code, String stateToken, String error) {
        GoogleCalendarOAuthState oauthState = stateRepository.findByStateToken(stateToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OAuth state"));

        if (oauthState.getExpiresAt().isBefore(LocalDateTime.now())) {
            stateRepository.delete(oauthState);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OAuth state expired");
        }

        if (error != null && !error.isBlank()) {
            stateRepository.delete(oauthState);
            return buildRedirect(oauthState.getRedirectUri(), "googleCalendar", "denied");
        }

        if (code == null || code.isBlank()) {
            stateRepository.delete(oauthState);
            return buildRedirect(oauthState.getRedirectUri(), "googleCalendar", "failed");
        }

        JsonNode tokenResponse = exchangeAuthorizationCode(code);
        GoogleCalendarConnection connection = connectionRepository.findByDoctorId(oauthState.getDoctorId())
                .orElseGet(GoogleCalendarConnection::new);

        connection.setDoctorId(oauthState.getDoctorId());
        connection.setDoctorEmail(oauthState.getDoctorEmail());
        connection.setAccessToken(tokenResponse.path("access_token").asText());
        connection.setRefreshToken(tokenResponse.path("refresh_token").asText(connection.getRefreshToken()));
        connection.setScopes(tokenResponse.path("scope").asText(GOOGLE_SCOPES));
        connection.setAccessTokenExpiresAt(LocalDateTime.now().plusSeconds(tokenResponse.path("expires_in").asLong(3600)));
        connection.setGoogleEmail(fetchGoogleEmail(connection.getAccessToken()));
        connection.setConnectedAt(connection.getConnectedAt() == null ? LocalDateTime.now() : connection.getConnectedAt());
        connection.setUpdatedAt(LocalDateTime.now());
        connectionRepository.save(connection);

        stateRepository.delete(oauthState);
        return buildRedirect(oauthState.getRedirectUri(), "googleCalendar", "connected");
    }

    public GoogleCalendarConnectionStatusDTO getStatus(
            String email,
            String token,
            String role,
            Long doctorIdFromToken) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        Optional<GoogleCalendarConnection> connection = connectionRepository.findByDoctorId(doctorId);
        return new GoogleCalendarConnectionStatusDTO(
                isOAuthConfigured(),
                connection.isPresent(),
                email,
                connection.map(GoogleCalendarConnection::getGoogleEmail).orElse(null),
                connection.map(GoogleCalendarConnection::getAccessTokenExpiresAt).orElse(null),
                connection.map(GoogleCalendarConnection::getLastSyncedAt).orElse(null)
        );
    }

    public void disconnect(String email, String token, String role, Long doctorIdFromToken) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        connectionRepository.findByDoctorId(doctorId).ifPresent(connectionRepository::delete);
    }

    public GoogleCalendarSyncResponseDTO syncPatientAppointment(
            String email,
            String token,
            String role,
            Long doctorIdFromToken,
            Long patientId) {
        Long doctorId = resolveDoctorId(email, token, role, doctorIdFromToken);
        Patient patient = patientRepository.findByIdAndDoctorId(patientId, doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
        if (patient.getAppointmentDate() == null || patient.getAppointmentDate().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient does not have an appointment to sync");
        }

        GoogleCalendarConnection connection = connectionRepository.findByDoctorId(doctorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google Calendar is not connected for this doctor"));

        connection = refreshAccessTokenIfNeeded(connection);
        JsonNode response = upsertEvent(connection, patient);

        patient.setCalendarProvider("GOOGLE");
        patient.setCalendarSyncStatus("SYNCED");
        patient.setExternalCalendarEventId(response.path("id").asText(patient.getExternalCalendarEventId()));
        patientRepository.save(patient);

        connection.setLastSyncedAt(LocalDateTime.now());
        connection.setUpdatedAt(LocalDateTime.now());
        connectionRepository.save(connection);

        return new GoogleCalendarSyncResponseDTO(
                "SYNCED",
                response.path("id").asText(),
                response.path("htmlLink").asText()
        );
    }

    private JsonNode exchangeAuthorizationCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);
        form.add("grant_type", "authorization_code");
        return postGoogleForm(GOOGLE_TOKEN_URL, form, null);
    }

    private GoogleCalendarConnection refreshAccessTokenIfNeeded(GoogleCalendarConnection connection) {
        if (connection.getAccessTokenExpiresAt() != null && connection.getAccessTokenExpiresAt().isAfter(LocalDateTime.now().plusMinutes(1))) {
            return connection;
        }
        if (connection.getRefreshToken() == null || connection.getRefreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google Calendar refresh token is missing. Reconnect Google Calendar.");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", connection.getRefreshToken());
        form.add("grant_type", "refresh_token");
        JsonNode tokenResponse = postGoogleForm(GOOGLE_TOKEN_URL, form, null);

        connection.setAccessToken(tokenResponse.path("access_token").asText(connection.getAccessToken()));
        connection.setAccessTokenExpiresAt(LocalDateTime.now().plusSeconds(tokenResponse.path("expires_in").asLong(3600)));
        connection.setUpdatedAt(LocalDateTime.now());
        return connectionRepository.save(connection);
    }

    private JsonNode upsertEvent(GoogleCalendarConnection connection, Patient patient) {
        LocalDate appointmentDate = LocalDate.parse(patient.getAppointmentDate());
        LocalTime appointmentTime = patient.getAppointmentTime() == null || patient.getAppointmentTime().isBlank()
                ? LocalTime.of(9, 0)
                : LocalTime.parse(patient.getAppointmentTime());
        LocalDateTime start = LocalDateTime.of(appointmentDate, appointmentTime);
        LocalDateTime end = start.plusMinutes(30);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("summary", "Appointment - " + patient.getName());
        payload.put("description", buildEventDescription(patient));
        payload.put("start", Map.of("dateTime", start.atOffset(ZoneOffset.ofHoursMinutes(5, 30)).format(GOOGLE_EVENT_TIME_FORMAT), "timeZone", "Asia/Kolkata"));
        payload.put("end", Map.of("dateTime", end.atOffset(ZoneOffset.ofHoursMinutes(5, 30)).format(GOOGLE_EVENT_TIME_FORMAT), "timeZone", "Asia/Kolkata"));
        payload.put("reminders", Map.of(
                "useDefault", false,
                "overrides", java.util.List.of(Map.of("method", "popup", "minutes", patient.getAppointmentReminderMinutes() == null ? 60 : patient.getAppointmentReminderMinutes()))
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(connection.getAccessToken());
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            if (patient.getExternalCalendarEventId() != null && !patient.getExternalCalendarEventId().isBlank()) {
                ResponseEntity<JsonNode> response = restTemplate.exchange(
                        GOOGLE_CALENDAR_EVENTS_URL + "/{eventId}",
                        HttpMethod.PUT,
                        entity,
                        JsonNode.class,
                        patient.getExternalCalendarEventId()
                );
                return requireBody(response, "Google Calendar did not return an event");
            }

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    GOOGLE_CALENDAR_EVENTS_URL,
                    HttpMethod.POST,
                    entity,
                    JsonNode.class
            );
            return requireBody(response, "Google Calendar did not return an event");
        } catch (HttpStatusCodeException ex) {
            patient.setCalendarProvider("GOOGLE");
            patient.setCalendarSyncStatus("FAILED");
            patientRepository.save(patient);
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Google Calendar sync failed: " + extractGoogleError(ex.getResponseBodyAsString())
            );
        }
    }

    private JsonNode postGoogleForm(String url, MultiValueMap<String, String> form, String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        if (bearerToken != null && !bearerToken.isBlank()) {
            headers.setBearerAuth(bearerToken);
        }
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(form, headers);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.POST, entity, JsonNode.class);
            return requireBody(response, "Google OAuth did not return a response body");
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Google OAuth request failed: " + extractGoogleError(ex.getResponseBodyAsString())
            );
        }
    }

    private String fetchGoogleEmail(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(GOOGLE_USERINFO_URL, HttpMethod.GET, entity, JsonNode.class);
            return requireBody(response, "Google user info missing").path("email").asText(null);
        } catch (HttpStatusCodeException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to fetch Google account details: " + extractGoogleError(ex.getResponseBodyAsString())
            );
        }
    }

    private JsonNode requireBody(ResponseEntity<JsonNode> response, String message) {
        if (response.getBody() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
        }
        return response.getBody();
    }

    private String buildEventDescription(Patient patient) {
        StringBuilder description = new StringBuilder();
        description.append("Patient: ").append(patient.getName());
        if (patient.getPatientNumber() != null) {
            description.append("\nPatient ID: ").append(patient.getPatientNumber());
        }
        if (patient.getMobile() != null && !patient.getMobile().isBlank()) {
            description.append("\nMobile: ").append(patient.getMobile());
        }
        if (patient.getAppointmentStatus() != null && !patient.getAppointmentStatus().isBlank()) {
            description.append("\nStatus: ").append(patient.getAppointmentStatus());
        }
        return description.toString();
    }

    private String extractGoogleError(String responseBody) {
        return responseBody == null || responseBody.isBlank() ? "Unknown Google error" : responseBody;
    }

    private boolean isOAuthConfigured() {
        return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
    }

    private void requireOAuthConfigured() {
        if (!isOAuthConfigured()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google Calendar OAuth is not configured on the server");
        }
    }

    private String sanitizeRedirectUri(String requestedRedirectUri) {
        if (requestedRedirectUri == null || requestedRedirectUri.isBlank()) {
            return defaultPostConnectRedirect;
        }
        if (requestedRedirectUri.startsWith("http://") || requestedRedirectUri.startsWith("https://")) {
            return requestedRedirectUri;
        }
        return defaultPostConnectRedirect;
    }

    private String buildRedirect(String target, String key, String value) {
        return UriComponentsBuilder.fromUriString(target)
                .queryParam(key, value)
                .build(true)
                .toUriString();
    }

    private Long resolveDoctorId(String email, String token, String role, Long doctorIdFromToken) {
        if ("RECEPTIONIST".equalsIgnoreCase(role)) {
            if (doctorIdFromToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Doctor context missing in token");
            }
            return doctorIdFromToken;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<DoctorResponseDTO> response = restTemplate.exchange(
                doctorServiceUrl + "/doctors/email/{email}",
                HttpMethod.GET,
                entity,
                DoctorResponseDTO.class,
                email
        );
        DoctorResponseDTO doctorResponse = response.getBody();
        if (doctorResponse == null || doctorResponse.getId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found for email: " + email);
        }
        return doctorResponse.getId();
    }
}
