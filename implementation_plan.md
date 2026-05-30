# Uni-Medicare — Database & Backend Complete Build

Full overhaul of the database (MySQL → PostgreSQL) and Spring Boot backend to match `plan_db.md` and `plan_backend.md`. Remove all DIU references. Fix repo structure to proper monorepo.

---

## User Review Required

> [!IMPORTANT]
> **Monorepo restructure** — All Spring Boot source will be moved from the repo root into a `backend/` subdirectory. The `pom.xml`, `src/`, `mvnw` files move there. The root will only contain `docker-compose.yml`, `.env.example`, `README.md`, `project-plans/`, and the new `db/` folder. This is a breaking change for your current workflow — you'll need to `cd backend` to run Maven commands, or use the root `docker-compose.yml`.

> [!WARNING]
> **MySQL → PostgreSQL migration** — The existing MySQL docker volume (`mysql_data`) becomes obsolete. All data in any existing local MySQL containers will NOT be migrated — the new PostgreSQL seed data provides a fresh development dataset.

> [!IMPORTANT]
> **No MapStruct** — Given the scope of this work, I'll implement DTOs as simple Java records with manual mapping methods (static `fromEntity()` factory methods). This avoids adding MapStruct annotation processor complexity and keeps the code more readable for a learning/portfolio project. If you want MapStruct later, it's a clean follow-up.

---

## Open Questions

> [!IMPORTANT]
> **Base package name** — Currently `com.uni.medicare`. The plan says `com.unimedicare`. I'll keep `com.uni.medicare` since changing the base package would rename every single file for no functional benefit. Please confirm you're OK with this.

> [!IMPORTANT]
> **BillingService stored procedure calls** — The current code uses `SimpleJdbcCall` with MySQL `CALL procedure_name(...)` syntax. PostgreSQL uses `SELECT function_name(...)` instead. I'll switch to native `@Query` with `SELECT transfer_funds(...)` syntax, which is cleaner for PostgreSQL functions.

---

## Proposed Changes

The work is organized into 7 phases, executed sequentially.

---

### Phase 1: Monorepo Restructure + PostgreSQL Migration

Restructure the flat Spring Boot project into the planned monorepo layout and switch all infrastructure from MySQL to PostgreSQL.

#### [NEW] `db/schema.sql`
Full PostgreSQL schema with all 22+ tables including the 3 missing ones (`email_verification_tokens`, `password_reset_tokens`, `file_uploads`). Adds missing columns (`students.password`, `students.email_verified`, `patients.profile_picture_id`, `lab_results.upload_id`). Uses `SERIAL`/`GENERATED ALWAYS AS IDENTITY`, `TIMESTAMP`, `NUMERIC`, `JSONB`, `SMALLINT` — all PostgreSQL-native types.

#### [NEW] `db/functions.sql`
PL/pgSQL functions replacing MySQL stored procedures:
- `transfer_funds(p_sender_student_id, p_medical_center_account_id, p_amount)` — uses `RAISE EXCEPTION` instead of `SIGNAL SQLSTATE`
- `add_invoice_line_item(p_invoice_id, p_service_id, p_description, p_quantity, p_unit_price)`

#### [NEW] `db/triggers.sql`
PL/pgSQL trigger functions + trigger bindings:
- `set_updated_at()` — attached to `accounts`, `students`, `medical_staffs`, `appointments`, `invoices`
- `fn_generate_invoice_after_vitals()` — `AFTER INSERT ON vital_signs`
- `fn_complete_appointment_on_consult()` — `AFTER INSERT ON consultations`
- `fn_audit_student_status_change()` — `AFTER UPDATE ON students`

#### [NEW] `db/seed.sql`
Comprehensive seed data:
- 1 medical center account (ID=1, balance=100000.00)
- 5 departments, 5 roles
- 10 staff members (2 doctors, 2 nurses, 2 lab techs, 2 receptionists, 1 admin, 1 super-admin)
- Staff schedules (5 days/week coverage)
- 20 students with accounts, patients, histories
- 10 services, 10 lab test catalog entries
- Sample appointments, consultations, vitals, prescriptions, lab results, invoices
- All passwords: bcrypt of `Password123!`

#### [NEW] `db/Dockerfile`
PostgreSQL 16 Alpine image, copies SQL files in numbered order.

#### [MODIFY] `docker-compose.yml` → root level
Rewritten for PostgreSQL + proper monorepo paths. Uses `.env` variables, health checks, upload volume.

#### [NEW] `.env.example`
Template with all required environment variables.

#### [DELETE] `src/main/resources/unimedicare_v3.sql`
Replaced by `db/` split files.

#### File moves: `src/`, `pom.xml`, `mvnw` → `backend/`
The Spring Boot application moves into `backend/` subdirectory.

---

### Phase 2: Backend Infrastructure — POM, Config, Main Class

#### [MODIFY] `backend/pom.xml`
- Replace `mysql-connector-j` with `postgresql` (runtime)
- Add `springdoc-openapi-starter-webmvc-ui:2.5.0`
- Add `spring-boot-starter-mail`

#### [MODIFY] `backend/src/.../application.properties` → `application.yml`
Convert to YAML format with:
- PostgreSQL datasource config (env vars)
- JPA dialect → `PostgreSQLDialect`
- JWT secret from `${JWT_SECRET}`
- Mail config from env vars
- Upload config: `app.upload.base-path`, `app.upload.max-file-size-mb`
- `app.medical-center-account-id: 1`

#### [MODIFY] `MedicalCenterApplication.java` → `UniMedicareApplication.java`
Rename class and file.

---

### Phase 3: Entity Fixes + DTO Layer

Fix all entities for PostgreSQL compatibility and add DTOs to prevent data leaks.

#### [MODIFY] `shared/entity/Student.java`
- Add `password` field (`VARCHAR(255) NOT NULL`)
- Add `emailVerified` field (`Boolean`, default `false`)
- Fix comment: "MySQL" → "PostgreSQL" on `expiresOn`

#### [MODIFY] `shared/entity/Patient.java`
- Add `profilePictureId` field (FK to `file_uploads`)

#### [MODIFY] `lab/LabResult.java`
- Add `uploadId` field (FK to `file_uploads`)

#### [MODIFY] `billing/Service.java`
- Fix entity to match plan schema: add `category`, `isActive`, rename `defaultPrice` → `unitPrice`

#### [MODIFY] `billing/InvoiceLineItem.java`
- Fix comment: "MySQL" → "PostgreSQL"

#### [MODIFY] `vital/VitalSign.java`
- Fix comment: "MySQL" → "PostgreSQL"

#### [MODIFY] `audit/AuditLog.java`
- Change `columnDefinition = "JSON"` → `"JSONB"`

#### [NEW] `shared/dto/` — Response DTOs
New Java record classes for every entity response to prevent leaking passwords and internal data:
- `StudentResponse` — excludes password
- `MedicalStaffResponse` — excludes password
- `PatientResponse`
- `AppointmentResponse`
- `ConsultationResponse`
- `VitalSignsResponse`
- `PrescriptionResponse` (with nested medicines + lab tests)
- `LabResultResponse`
- `InvoiceResponse` (with nested line items)
- `NotificationResponse`
- `AuditLogResponse`

Each DTO has a `static fromEntity(Entity e)` factory method.

---

### Phase 4: Auth Fixes + Email Service + File Uploads

#### [MODIFY] `auth/AuthService.java`
- Fix student login: validate `passwordEncoder.matches()` against `student.getPassword()`
- Add audit logging for login events
- Remove the TODO comment

#### [MODIFY] `auth/AuthController.java`
- Add `GET /api/auth/verify-email`
- Add `POST /api/auth/forgot-password`
- Add `POST /api/auth/reset-password`

#### [NEW] `auth/emailverification/EmailVerificationToken.java`
JPA entity for `email_verification_tokens` table.

#### [NEW] `auth/emailverification/EmailVerificationService.java`
Token generation, email sending, verification flow.

#### [NEW] `auth/passwordreset/PasswordResetToken.java`
JPA entity for `password_reset_tokens` table.

#### [NEW] `auth/passwordreset/PasswordResetService.java`
Token generation, email sending, reset flow.

#### [NEW] `shared/email/EmailService.java`
`JavaMailSender` wrapper with methods:
- `sendVerificationEmail(String to, String token)`
- `sendPasswordResetEmail(String to, String token)`
- `sendAppointmentConfirmation(String to, appointmentDetails)`
- `sendLabResultReady(String to, testName)`

#### [NEW] `upload/FileUpload.java`
JPA entity for `file_uploads` table.

#### [NEW] `upload/FileUploadRepository.java`

#### [NEW] `upload/FileUploadService.java`
MIME validation, size validation, UUID filename, disk storage, metadata persistence, file streaming.

#### [NEW] `upload/FileUploadController.java`
- `POST /api/uploads/profile-picture` (STUDENT)
- `POST /api/uploads/lab-result/{resultId}` (LAB_TECHNICIAN)
- `GET /api/uploads/{uploadId}` (authenticated, access-controlled)

---

### Phase 5: Bug Fixes + Missing Features

#### [MODIFY] `appointment/AppointmentController.java`
Fix student→patient ID lookup: use `PatientRepository.findByStudent_StudentId()` instead of treating `user.getId()` as `patientId`.

#### [MODIFY] `consultation/ConsultationController.java`
Same student→patient ID fix.

#### [MODIFY] `lab/LabResultController.java`
Same student→patient ID fix for `/my` endpoint.

#### [MODIFY] `prescription/PrescriptionService.java`
Fix `addLabTest()`: after persisting `PrescriptionLabTest`, create a corresponding `LabResult` row with `resultStatus = "pending"`.

#### [MODIFY] `billing/BillingService.java`
- Extract `medicalCenterAccountId` to `@Value("${app.medical-center-account-id}")` 
- Switch `SimpleJdbcCall` to native `@Query` for PostgreSQL functions
- Add `MockPaymentGateway` integration

#### [NEW] `billing/MockPaymentGateway.java`
- 90% success / 10% failure simulation
- Returns `PaymentGatewayResponse { success, gatewayTransactionId, message }`

#### [MODIFY] `notification/NotificationService.java`
- Use `req.channel()` instead of hardcoding `"in_app"` (add `channel` field to request DTO)
- Call `EmailService` when channel is `"email"`

#### [MODIFY] `notification/CreateNotificationRequest.java`
- Add optional `channel` field

#### [MODIFY] `audit/AuditService.java` + `AuditController.java`
- Switch from `findAll()` to `findAll(Pageable)` — return `Page<AuditLog>`

#### [MODIFY] `audit/AuditAspect.java`
- Add pointcut for `AuthService.login()` — log LOGIN events

---

### Phase 6: Admin Endpoints + Security Config + OpenAPI

#### [NEW] `admin/StudentAdminController.java`
Full CRUD for `/api/admin/students`:
- GET all students (with pagination)
- GET single student
- POST create student (with account + patient creation)
- PUT update student
- PATCH activate/deactivate

#### [NEW] `admin/ServiceAdminController.java`
Full CRUD for `/api/admin/services`:
- GET all services
- POST create service
- PUT update service
- PATCH toggle active/inactive

#### [MODIFY] `shared/config/SecurityConfig.java`
- Permit Swagger endpoints: `/swagger-ui/**`, `/v3/api-docs/**`
- Permit new public auth endpoints: `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`

#### [NEW] `shared/config/OpenApiConfig.java`
SpringDoc OpenAPI config with:
- API title: "Uni Medicare API"
- Bearer JWT security scheme
- Grouped API definitions

---

### Phase 7: Patient Repository + Return DTOs from Controllers + Final Cleanup

#### [NEW] `shared/repository/PatientRepository.java`
Shared repository (needed by multiple controllers for student→patient lookup):
```java
Optional<Patient> findByStudent_StudentId(Integer studentId);
```

#### [MODIFY] All controllers
Update return types from raw entities to DTOs. Every list/single endpoint returns the DTO version.

#### [MODIFY] `admin/AdminControllers.java`
- Staff endpoints: return `MedicalStaffResponse` (no password leak)
- Use `PasswordEncoder` when creating staff (hash the password on POST/PUT)

#### [MODIFY] `backend/README.md`
Update for PostgreSQL, monorepo structure, new features.

#### [DELETE] Old `README.md` at root
Replace with monorepo-level README.

---

## Verification Plan

### Automated Tests

1. **Build verification**:
   ```bash
   cd backend && ./mvnw clean compile -DskipTests
   ```
   Must compile with zero errors.

2. **Docker Compose validation**:
   ```bash
   docker compose config
   ```
   Must parse without errors.

3. **SQL syntax validation**:
   ```bash
   docker compose up db -d
   # Wait for healthy, then check logs for SQL errors
   docker compose logs db
   ```
   All 4 SQL files must execute without errors.

4. **Full stack boot**:
   ```bash
   docker compose up --build
   ```
   Backend must start and connect to PostgreSQL successfully.

5. **Swagger UI availability**:
   ```
   GET http://localhost:8080/swagger-ui/index.html
   ```

### Manual Verification
- Test login endpoint with seed data credentials
- Verify JWT contains correct claims
- Check that admin staff list does NOT contain password hashes
- Verify student→patient ID resolution works correctly
