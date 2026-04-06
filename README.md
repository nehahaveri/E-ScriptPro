# E-ScriptPro 🩺  
A microservices-based e-prescription platform with secure doctor-scoped data access, medicine autocomplete, Redis caching, Kafka-based async processing, and PDF prescription generation.

## Overview
E-ScriptPro is designed as a SaaS-style backend system where doctors can:
- Sign up/login
- Create and manage only their own patients
- Create prescriptions with tablet/syrup/injection details
- Search medicine suggestions with low-latency autocomplete
- Generate downloadable prescription PDFs

The system combines:
- **Synchronous REST** for core transactional flow
- **Asynchronous Kafka events** for decoupled processing
- **Redis caching** for fast autocomplete responses

---

## Core Features 🚀
- JWT-secured microservices architecture
- API Gateway routing and centralized token validation
- Doctor profile auto-provisioning after auth signup
- Doctor-based patient data isolation (multi-tenant enforcement)
- Prescription ownership validation before access/write
- Medicine autocomplete with ranking:
  - starts-with matches first
  - contains matches next
  - top 10 results
- Redis-backed suggestion caching with TTL and cache key normalization
- Cache invalidation on medicine data write/load
- Custom medicine support:
  - unknown brand/name entries are accepted
  - prescription still saves
  - PDF still generates
- PDF generation with structured tables (Tablets / Syrups / Injections)
- Kafka producer in prescription-service and consumer in pdf-service
- Global exception handlers with JSON error responses

---

## Services & Responsibilities 🧩

### `authservice` (Port `8080`)
- Handles signup/login and JWT generation
- Stores auth-only user credentials in `auth_db`
- On successful signup, calls doctor-service to create doctor profile

### `doctor-service` (Port `8086`)
- Stores doctor profile data in `doctor_db`
- Endpoints:
  - `POST /doctors`
  - `GET /doctors/email/{email}`

### `patient-service` (Port `8082`)
- Stores patient records in `patient_db`
- Derives doctor context from JWT email + doctor-service lookup
- Returns only doctor-owned patients
- Blocks cross-doctor access with `403`

### `prescription-service` (Port `8083`)
- Stores prescriptions and medicine line items in `prescription_db`
- Validates patient ownership through patient-service before save/access
- Generates PDF synchronously via pdf-service REST
- Publishes Kafka event (`prescription-events`) after prescription save
- Exposes patient history sorted DESC

### `medicine-service` (Port `8084`)
- Search API for medicine suggestions from `medicine_db`
- Autocomplete ranking and optional type filter
- Redis cache (`medicineCache`) with TTL and JSON value serialization
- DB indexes on `medicine_name` and `brand`

### `pdf-service` (Port `8085`)
- Generates prescription PDF via OpenPDF
- REST endpoint for sync PDF generation
- Kafka consumer for async event handling from `prescription-events`

### `api-gateway` (Port `8081`)
- Routes `/api/**` traffic to internal services
- Strips prefix before forwarding
- Validates JWT for protected routes
- Public paths include:
  - `/api/auth/**`
  - `/health`

---

## Architecture 🏗️

```text
Client (React)
   |
   v
API Gateway (8081)  -- JWT validation
   |
   +--> Auth Service (8080) ---------> Doctor Service (8086)
   |        signup/login                    profile create/fetch
   |
   +--> Patient Service (8082) <------ Doctor Service (8086)
   |        doctor-owned patient CRUD       doctorId lookup by email
   |
   +--> Medicine Service (8084) ----> Redis (cache) ----> PostgreSQL fallback
   |        autocomplete ranking
   |
   +--> Prescription Service (8083)
            | sync REST
            v
         PDF Service (8085)  -> returns PDF bytes
            ^
            | async Kafka consumer (prescription-events)
Kafka <-----+
            ^
            | async producer
         Prescription Service
```

---

## Sync + Async Flows 🔄

### Synchronous flow
1. Doctor creates prescription via gateway.
2. prescription-service validates patient ownership.
3. prescription-service saves prescription and line items.
4. prescription-service calls `POST /pdf/generate`.
5. PDF bytes are returned in HTTP response.

### Asynchronous flow
1. After save, prescription-service publishes event to Kafka topic `prescription-events`.
2. pdf-service listens to `prescription-events` (`groupId=pdf-group`).
3. pdf-service consumes event and triggers PDF generation internally.

---

## Tech Stack 🛠️
- Java 21
- Spring Boot 4.0.5
- Spring Web MVC (services)
- Spring WebFlux + Spring Cloud Gateway (gateway)
- Spring Security + JWT (JJWT 0.12.7)
- Spring Data JPA (PostgreSQL)
- Spring Data Redis
- Spring Kafka
- OpenPDF (`com.github.librepdf:openpdf:1.3.30`)
- Lombok
- Maven

---

## Engineering Highlights 💡
- **Multi-tenant safety by design**:
  - doctorId is never trusted from client input
  - derived from JWT identity and validated via service-to-service calls
- **Autocomplete relevance tuning**:
  - custom JPQL ranking with starts-with priority
  - deterministic ordering + pagination cap
- **Cache design**:
  - normalized case-insensitive key
  - TTL-based expiration (10 min)
  - null-value caching disabled
  - cache error handler falls back safely
- **Resilience in distributed calls**:
  - soft medicine validation accepts custom entries when lookup fails
  - Kafka producer failure does not block sync prescription/PDF flow
- **Dual-mode PDF strategy**:
  - immediate sync PDF for UX continuity
  - async Kafka pipeline for event-driven extension

---

## API Examples (Gateway) 📡

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Doctors
- `POST /api/doctors`
- `GET /api/doctors/email/{email}`

### Patients
- `POST /api/patients`
- `GET /api/patients`
- `GET /api/patients/{patientId}`

### Medicines
- `GET /api/medicines/search?query=Ci&type=TABLET`
- `type` is optional

### Prescriptions
- `POST /api/prescriptions` (returns PDF bytes)
- `GET /api/prescriptions/patient/{patientId}`

### PDF direct
- `POST /api/pdf/generate`

### Health
- `GET /health` on each service port
- `GET http://localhost:8081/health` for gateway

---

## End-to-End Flow ✅
1. Doctor signs up/logs in and receives JWT.
2. Doctor creates patient profile.
3. Doctor types medicine prefix (`Ci`) in frontend.
4. Frontend calls medicine search via gateway.
5. Redis-backed suggestions are returned quickly.
6. Doctor selects suggestion or types custom medicine text.
7. Prescription is saved with ownership validation.
8. Kafka event is published.
9. PDF is generated synchronously for immediate response.
10. PDF service also consumes Kafka event asynchronously.

---

## Setup Instructions ⚙️

### Prerequisites
- Java 21
- Maven
- PostgreSQL running locally
- Redis on `localhost:6379`
- Kafka broker on `localhost:9092`

### Databases expected by services
- `auth_db`
- `doctor_db`
- `patient_db`
- `prescription_db`
- `medicine_db`

### Run services
Start each module from its directory:
```bash
mvn -DskipTests spring-boot:run
```

Recommended startup order:
1. `authservice` (8080)
2. `doctor-service` (8086)
3. `patient-service` (8082)
4. `medicine-service` (8084)
5. `pdf-service` (8085)
6. `prescription-service` (8083)
7. `api-gateway` (8081)

---

## Security Model 🔐
- JWT secret is shared across gateway and secured services.
- Gateway validates Bearer token on protected routes.
- Service-level JWT filters enforce stateless security.
- Doctor-based ownership checks prevent cross-doctor data access.
- Patient and prescription access is scoped to authenticated doctor context.

---

## Performance & Scalability 📈
- Redis reduces repeated autocomplete latency.
- Query ranking and DB indexing optimize dropdown relevance.
- Kafka decouples prescription-write from downstream consumers.
- Stateless services are horizontally scalable behind gateway/load balancer.
- Sync + async dual path provides both UX immediacy and extensibility.

---

## Future Improvements 🛣️
- Add containerization and orchestration (Docker Compose / Kubernetes)
- Add centralized config and service discovery
- Add observability stack (Prometheus/Grafana/ELK/OpenTelemetry)
- Add retry/DLQ strategy for Kafka consumer failures
- Add contract and integration test suites across services
- Add role granularity and refresh token strategy
- Add frontend deployment docs and production CI/CD pipeline

---

## Author 👩‍💻
**Neha Haveri**  
Repository: `https://github.com/nehahaveri/E-ScriptPro`
