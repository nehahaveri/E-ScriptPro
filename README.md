# E-ScriptPro 🩺

Professional e-prescription platform built with Spring Boot microservices and a React frontend.

## Overview 🚀

E-ScriptPro helps clinics manage doctor workflows end to end:

- Secure authentication with JWT
- Doctor profile management
- Patient registration and search
- Prescription creation with PDF export
- Medicine autocomplete with Redis-backed caching
- Follow-up and appointment handling
- Google Calendar sync for patient appointments
- Receptionist support for clinic operations

## Tech Stack 🛠️

- Backend: Java 21, Spring Boot, Spring Cloud Gateway, Spring Security
- Frontend: React, Vite, Tailwind CSS, Axios
- Database: PostgreSQL
- Messaging: Kafka
- Cache: Redis
- Documents: OpenPDF

## Architecture 🧩

Frontend:
- `escriptpro-frontend`

Backend services:
- `api-gateway` -> `8081`
- `authservice` -> `8080`
- `patient-service` -> `8082`
- `prescription-service` -> `8083`
- `medicine-service` -> `8084`
- `pdf-service` -> `8085`
- `doctor-service` -> `8086`
- `receptionist-service` -> `8087`

## Key Features ✨

- Role-aware access for doctors and receptionists
- Doctor-scoped patient data isolation
- Medicine suggestions by brand and medicine name
- PDF prescription generation and download
- Doctor asset upload support for logo and signature
- X-ray/image upload support in prescription flow
- Appointment listing, follow-ups, and calendar invite export
- Optional Google Calendar OAuth integration

## Local Setup ⚙️

### Prerequisites

- Java 21
- Maven
- Node.js + npm
- PostgreSQL
- Redis
- Kafka

### Run Backend

Start each Spring Boot service from its own folder:

```bash
mvn spring-boot:run
```

Suggested order:

1. `authservice`
2. `doctor-service`
3. `receptionist-service`
4. `patient-service`
5. `medicine-service`
6. `pdf-service`
7. `prescription-service`
8. `api-gateway`

### Run Frontend

```bash
cd escriptpro-frontend
npm install
npm run dev
```

Frontend defaults to the API Gateway at `http://localhost:8081/api`.

## Notes 📌

- Each service uses its own PostgreSQL database.
- Google Calendar integration requires OAuth credentials in `patient-service`.
- The gateway exposes all backend APIs under `/api/*`.

## Status ✅

This repository is structured as a production-style microservices project with a working frontend and independently deployable backend services.
