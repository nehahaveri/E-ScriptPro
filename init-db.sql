-- Create databases for each service
CREATE DATABASE authservice_db;
CREATE DATABASE doctor_service_db;
CREATE DATABASE patient_service_db;
CREATE DATABASE medicine_service_db;
CREATE DATABASE prescription_service_db;
CREATE DATABASE receptionist_service_db;
CREATE DATABASE pdf_service_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE authservice_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE doctor_service_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE patient_service_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE medicine_service_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE prescription_service_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE receptionist_service_db TO escriptpro;
GRANT ALL PRIVILEGES ON DATABASE pdf_service_db TO escriptpro;