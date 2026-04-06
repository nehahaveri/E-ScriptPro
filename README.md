# E-ScriptPro
E-ScriptPro is a microservices-based e-prescription platform with a React frontend, API Gateway, JWT security, doctor-scoped data isolation, medicine autocomplete, PDF generation, Redis caching, and Kafka event publishing/consuming.

## Overview
The current system supports a doctor-first workflow:
1. Doctor signup/login
2. Doctor profile management
3. Patient creation and search
4. Patient-based or quick prescription creation
5. PDF generation and download

Backend services are split by domain and connected through REST (sync) and Kafka (async).

## Current Features
- JWT-based authentication and protected APIs
- Doctor onboarding:
  - Signup with `name`, `email`, `phone`, `password`
  - Login with `email or phone` + password
  - Forgot/reset password flow
- Doctor profile management (`/doctors/me`)
- Doctor profile fields:
  - name, phone, clinicName, locality, specialization, education, experience
  - optional logo and signature URLs
- Logo/signature file upload in doctor-service (multipart)
- Patient management:
  - create patient
  - list own patients
  - get own patient by id
  - search own patients by name/mobile
- Prescription management:
  - patient-based prescriptions
  - quick prescriptions (no patient linkage)
  - patient prescription history
- Medicine autocomplete via medicine-service:
  - TABLET / SYRUP / INJECTION
  - starts-with ranking before contains
  - top 10 results
- PDF generation with tables for tablets/syrups/injections
- PDF includes doctor metadata passed in request (name/clinic/locality/education and optional logo/signature URLs)
- Redis-backed caching for medicine search
- Kafka event flow from prescription-service to pdf-service

## Architecture
```text
React Frontend (Vite)
   |
   v
API Gateway (8081)
   |
   +--> authservice (8080)
   +--> doctor-service (8086)
   +--> patient-service (8082)
   +--> prescription-service (8083)
   +--> medicine-service (8084)
   +--> pdf-service (8085)

External infra:
- PostgreSQL (service-specific DBs)
- Redis (medicine search cache)
- Kafka (prescription events)
```

## Services And Responsibilities
### `authservice` (`8080`)
- Signup/login
- Forgot/reset password
- Stores auth users in `auth_db`
- Generates JWT tokens
- Calls doctor-service on signup to create doctor profile

### `doctor-service` (`8086`)
- Stores doctor profiles in `doctor_db`
- Doctor lookup by email/phone
- `GET/PUT /doctors/me`
- Upload logo/signature files (`POST /doctors/upload`)
- Serves uploaded files (`GET /doctors/files/{filename}`)

### `patient-service` (`8082`)
- Stores patients in `patient_db`
- Uses JWT identity + doctor-service lookup to scope data
- Provides doctor-owned patient CRUD/search endpoints

### `prescription-service` (`8083`)
- Stores prescriptions and line items in `prescription_db`
- Validates patient ownership for patient-based prescriptions
- Supports quick mode by allowing `patientId = null`
- Calls pdf-service synchronously and returns PDF bytes
- Publishes Kafka event `prescription-events`

### `medicine-service` (`8084`)
- Medicine search endpoint for autocomplete
- Ranking logic (starts-with first, then contains)
- Optional type filter
- Redis cache (`medicineCache`) with TTL 10 minutes

### `pdf-service` (`8085`)
- Generates PDF using OpenPDF
- REST endpoint for sync generation
- Kafka consumer listening on `prescription-events`

### `api-gateway` (`8081`)
- Route forwarding for `/api/**`
- Strips `/api` prefix before forwarding
- JWT validation via global filter
- Auth endpoints are excluded from JWT validation (`/api/auth/**`)

## API Gateway Routes
- `/api/auth/**` -> `http://localhost:8080`
- `/api/doctors/**` -> `http://localhost:8086`
- `/api/patients/**` -> `http://localhost:8082`
- `/api/prescriptions/**` -> `http://localhost:8083`
- `/api/medicines/**` -> `http://localhost:8084`
- `/api/pdf/**` -> `http://localhost:8085`

## Key Backend APIs (Current)
### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /health`

### Doctor
- `POST /doctors`
- `GET /doctors/email/{email}`
- `GET /doctors/phone/{phone}`
- `GET /doctors/me`
- `PUT /doctors/me`
- `POST /doctors/upload` (multipart: `file`, `type=logo|signature`)
- `GET /doctors/files/{filename}`
- `GET /health`

### Patient
- `POST /patients`
- `GET /patients`
- `GET /patients/{patientId}`
- `GET /patients/search?query=...`
- `GET /health`

### Prescription
- `POST /prescriptions` (returns PDF)
- `GET /prescriptions/patient/{patientId}`
- `GET /health`

### Medicine
- `GET /medicines/search?query=...&type=TABLET|SYRUP|INJECTION`
- `GET /health`

### PDF
- `POST /pdf/generate`
- `GET /health`

## Frontend (React + Vite)
Path: `escriptpro-frontend`

Current pages:
- `/` -> Login
- `/signup` -> Signup
- `/forgot-password` -> Forgot password
- `/reset-password` -> Reset password
- `/dashboard` -> Doctor workspace

Dashboard includes:
- doctor profile edit
- logo/signature upload with preview
- patient create/search/list/select
- patient history view
- medicine autocomplete for tablets/syrups/injections
- patient-based and quick prescription submission

Frontend API integration:
- Axios base URL: `http://localhost:8081/api`
- JWT added from `localStorage.token` via interceptor

## Security Model
- JWT token issued by authservice
- Gateway checks JWT for protected `/api/**` routes
- Services also enforce JWT through their own filters/security config
- Patient and prescription access is scoped to authenticated doctor
- Upload endpoint is authenticated; file read endpoint is public for rendering

## Data Stores
- PostgreSQL DBs:
  - `auth_db`
  - `doctor_db`
  - `patient_db`
  - `prescription_db`
  - `medicine_db`
- Redis: medicine search cache
- Kafka: `prescription-events`

## Setup
### Prerequisites
- Java 21
- Maven
- Node.js + npm
- PostgreSQL running locally
- Redis on `localhost:6379`
- Kafka on `localhost:9092`

### Start backend services
From each service directory:
```bash
mvn spring-boot:run
```
Suggested order:
1. `authservice`
2. `doctor-service`
3. `patient-service`
4. `medicine-service`
5. `pdf-service`
6. `prescription-service`
7. `api-gateway`

### Start frontend
```bash
cd escriptpro-frontend
npm install
npm run dev
```

## Request Flow (Current)
1. Doctor signs up and logs in
2. JWT is stored in frontend
3. Doctor updates profile and optionally uploads logo/signature
4. Doctor creates/searches/selects patients
5. Doctor searches medicines while writing prescription
6. Prescription is saved (patient-based or quick mode)
7. PDF is returned synchronously to client
8. Prescription event is also published to Kafka and consumed by pdf-service

## Notes
- Logo/signature are optional in the profile and prescription flow.
- Uploads are stored in local `uploads/` directory under doctor-service runtime path.
- Medicine search cache uses Redis with 10-minute TTL and JSON serialization.

## Author
Neha Haveri
