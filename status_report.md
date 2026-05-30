# uni-medicare — Implementation Status Report
> Compared against: `plan_backend.md`, `plan_db.md`, `plan_frontend.md`
> Generated after full code review of `uni-medicare-springboot.zip`

---

## Overall Summary

| Area | Status | Notes |
|---|---|---|
| Backend — Core Structure | ✅ Done | Package-by-feature, correct base package `com.uni.medicare` |
| Backend — Auth & Security | 🟡 Partial | JWT works, student password login broken |
| Backend — All 9 Systems | ✅ Done | All controllers + services present |
| Backend — Business Rules | ✅ Done | All 7 rules implemented |
| Backend — DTOs | ❌ Missing | Raw entities returned everywhere |
| Backend — Email Service | ❌ Missing | Entire feature absent |
| Backend — File Uploads | ❌ Missing | Entire feature absent |
| Backend — Mock Payment Gateway | ❌ Missing | Calls DB directly, no gateway layer |
| Backend — Swagger/OpenAPI | ❌ Missing | No dependency, no config |
| Backend — MapStruct | ❌ Missing | No dependency added |
| Backend — Pagination | ❌ Missing | `getAll()` returns bare `List<>`, no `Page<T>` |
| Database — Schema | 🟡 Partial | MySQL syntax, not PostgreSQL |
| Database — Monorepo split | ❌ Missing | Single SQL file, not split into schema/functions/triggers/seed |
| Database — New tables | ❌ Missing | No `email_verification_tokens`, `password_reset_tokens`, `file_uploads` |
| Repo Structure — Monorepo | ❌ Missing | Flat Spring Boot project, no `backend/`, `db/`, `frontend/` folders |
| Frontend | ❌ Missing | Nothing generated |
| Docker | 🟡 Partial | MySQL docker-compose exists, needs full rewrite for PostgreSQL + monorepo |

---

## Backend — What's Implemented

### Infrastructure & Config
| File | Status | Notes |
|---|---|---|
| `MedicalCenterApplication.java` | ✅ | `@EnableAspectJAutoProxy` correctly present |
| `SecurityConfig.java` | ✅ | Stateless JWT, `@EnableMethodSecurity`, BCrypt, CSRF disabled |
| `JwtUtil.java` | ✅ | jjwt 0.12.5, HS256, correct claims (`id`, `role`, `type`) |
| `JwtAuthFilter.java` | ✅ | `OncePerRequestFilter`, validates token, sets `SecurityContext` |
| `StudentValidityFilter.java` | ✅ | Re-checks `is_active` + `expires_on` on every student request |
| `AppUserDetails.java` | ✅ | Unified principal, `ROLE_` prefix for `@PreAuthorize` |
| `GlobalExceptionHandler.java` | ✅ | All error types handled, consistent JSON shape |
| `AuditAspect.java` | ✅ | `@AfterReturning` on billing operations, IP resolution |
| `pom.xml` | 🟡 | MySQL driver present (should be PostgreSQL), missing: SpringDoc, MapStruct, Mail |

### Naming Issues
| Issue | Location |
|---|---|
| Main class named `MedicalCenterApplication` | Should be `UniMedicareApplication` |
| Comment in `VitalSign` says "MySQL calculates it" | Should say "PostgreSQL" |
| SQL file header still says "DIU Medical Center" | Should be "Uni Medicare" |
| SQL file still called `unimedicare_v3.sql` | Should drop version suffix |

---

### System 1 — Appointments
| Component | Status | Notes |
|---|---|---|
| `Appointment.java` entity | ✅ | |
| `AppointmentRepository.java` | ✅ | |
| `AppointmentService.java` | ✅ | Rules 1 & 2 enforced, conflict check present |
| `AppointmentController.java` | ✅ | All 4 endpoints, correct `@PreAuthorize` roles |
| `BookAppointmentRequest.java` | ✅ | |
| Student `GET /my` — patient ID lookup | 🟡 | Comment says "simplified" — uses `user.getId()` as `patientId` directly, which is wrong. Student ID ≠ Patient ID. Needs `PatientRepository` lookup. |

### System 2 — Consultations
| Component | Status | Notes |
|---|---|---|
| `Consultation.java` entity | ✅ | |
| `ConsultationRepository.java` | ✅ | |
| `ConsultationService.java` | ✅ | Rule 3 enforced |
| `ConsultationController.java` | ✅ | All 3 endpoints, correct roles |
| `OpenConsultationRequest.java` | ✅ | |

### System 3 — Vital Signs
| Component | Status | Notes |
|---|---|---|
| `VitalSign.java` entity | ✅ | `bmi` marked `insertable=false, updatable=false` |
| `VitalSignRepository.java` | ✅ | |
| `VitalSignService.java` | ✅ | Correctly does NOT call billing (relies on DB trigger) |
| `VitalSignController.java` | ✅ | Correct roles |
| `RecordVitalsRequest.java` | ✅ | |

### System 4 — Prescriptions
| Component | Status | Notes |
|---|---|---|
| `Prescription.java` entity | ✅ | |
| `PrescriptionMedicine.java` entity | ✅ | |
| `PrescriptionRepository.java` | ✅ | |
| `PrescriptionService.java` | ✅ | Rule 4 (`can_prescribe`) enforced |
| `PrescriptionController.java` | ✅ | All 4 endpoints, student own-only check present |
| `CreatePrescriptionRequest.java` | ✅ | |
| `AddMedicineRequest.java` | ✅ | |
| `AddLabTestRequest.java` | ✅ | |
| Lab result rows auto-created on `addLabTest` | ❌ | `addLabTest()` persists `PrescriptionLabTest` but does NOT create a corresponding `LabResult` row with `status=pending` as the plan requires |

### System 5 — Lab Results
| Component | Status | Notes |
|---|---|---|
| `LabResult.java` entity | ✅ | |
| `PrescriptionLabTest.java` entity | ✅ | |
| `LabTestCatalog.java` entity | ✅ | |
| `LabResultRepository.java` | ✅ | |
| `LabResultService.java` | ✅ | Rule 6 (status check) enforced |
| `LabResultController.java` | ✅ | All 3 endpoints; student results correctly strip `resultNotes` |
| `upload_id` on `LabResult` | ❌ | Missing — needed for PDF attachment |

### System 6 — Billing
| Component | Status | Notes |
|---|---|---|
| `Invoice.java` entity | ✅ | |
| `InvoiceLineItem.java` entity | ✅ | `total_price` generated column correctly mapped |
| `Transaction.java` entity | ✅ | |
| `Service.java` entity | ✅ | |
| `InvoiceRepository.java` | ✅ | |
| `BillingService.java` | ✅ | `SimpleJdbcCall` for both procedures, rule 5 enforced |
| `BillingController.java` | ✅ | All 4 endpoints, correct roles |
| `MockPaymentGateway` | ❌ | Missing — `payInvoice` calls DB function directly |
| `AddLineItemRequest.java` | ✅ | |

### System 7 — Notifications
| Component | Status | Notes |
|---|---|---|
| `Notification.java` entity | ✅ | |
| `NotificationRepository.java` | ✅ | |
| `NotificationService.java` | ✅ | Own-notification enforcement present |
| `NotificationController.java` | ✅ | All 3 endpoints, correct roles |
| `CreateNotificationRequest.java` | ✅ | |
| Email delivery on notification create | ❌ | `NotificationService.create()` hardcodes `channel = "in_app"`, never calls email service |

### System 8 — Audit Logs
| Component | Status | Notes |
|---|---|---|
| `AuditLog.java` entity | ✅ | `@JdbcTypeCode(SqlTypes.JSON)` on old/new value columns |
| `AuditLogRepository.java` | ✅ | |
| `AuditService.java` | ✅ | Read + write methods |
| `AuditController.java` | ✅ | Admin-only, correct role |
| `AuditAspect.java` | ✅ | Covers `payInvoice`, `updateStatus` |
| Login event audit | ❌ | `AuthService.login()` has no audit logging |
| Password reset audit | ❌ | Feature doesn't exist yet |
| Audit returns unpaginated list | ❌ | `findAll()` — no `Page<T>`, could be huge in prod |

### System 9 — Admin
| Component | Status | Notes |
|---|---|---|
| `AdminControllers.java` — departments | ✅ | Full CRUD |
| `AdminControllers.java` — roles | ✅ | Full CRUD |
| `AdminControllers.java` — staff | ✅ | Full CRUD, but returns raw `MedicalStaff` including `password` hash |
| `AdminControllers.java` — schedules | ✅ | Full CRUD |
| `AdminRepositories.java` | ✅ | All 4 repos |
| `/api/admin/students` CRUD | ❌ | Missing entirely |
| `/api/admin/services` CRUD | ❌ | Missing entirely |

---

## Backend — What's Missing Entirely

### Auth Extensions
| Feature | Status |
|---|---|
| `Student.password` field | ❌ Field not on entity, `AuthService` has a `TODO` comment and skips password check for students |
| `EmailVerificationToken` entity | ❌ |
| `PasswordResetToken` entity | ❌ |
| `GET /api/auth/verify-email` | ❌ |
| `POST /api/auth/forgot-password` | ❌ |
| `POST /api/auth/reset-password` | ❌ |
| `EmailService.java` | ❌ |
| `spring-boot-starter-mail` dependency | ❌ |
| `email_verified` flag on `Student` | ❌ |

### File Upload System
| Feature | Status |
|---|---|
| `FileUpload.java` entity | ❌ |
| `FileUploadRepository.java` | ❌ |
| `FileUploadService.java` | ❌ |
| `FileUploadController.java` | ❌ |
| `POST /api/uploads/profile-picture` | ❌ |
| `POST /api/uploads/lab-result/{resultId}` | ❌ |
| `GET /api/uploads/{uploadId}` | ❌ |
| `profile_picture_id` on `Patient` entity | ❌ |
| `upload_id` on `LabResult` entity | ❌ |

### API Documentation
| Feature | Status |
|---|---|
| `springdoc-openapi-starter-webmvc-ui` dependency | ❌ |
| `OpenApiConfig.java` | ❌ |
| Swagger UI at `/swagger-ui.html` | ❌ |
| `/swagger-ui/**` permitted in `SecurityConfig` | ❌ |

### DTO Layer
| Feature | Status |
|---|---|
| MapStruct dependency | ❌ |
| Any DTO / response class (beyond `LoginResponse`) | ❌ |
| `MedicalStaffResponse` (without password) | ❌ — admin endpoints leak `password` hash |
| `StudentResponse` | ❌ |
| `PatientResponse` | ❌ |

---

## Database — What's Implemented vs Plan

### Schema File
| Item | Status | Notes |
|---|---|---|
| All original tables present | ✅ | `accounts`, `students`, `patients`, `histories`, `departments`, `medical_staff_roles`, `medical_staffs`, `staff_schedules`, `appointments`, `consultations`, `vital_signs`, `services`, `prescriptions`, `prescription_medicines`, `lab_test_catalog`, `prescription_lab_tests`, `lab_results`, `transactions`, `invoices`, `invoice_line_items`, `notifications`, `audit_logs` |
| PostgreSQL syntax | ❌ | Still MySQL 8.0 (`AUTO_INCREMENT`, `DATETIME`, `ON UPDATE CURRENT_TIMESTAMP`, `DELIMITER $$`, MySQL procedures) |
| `students.password` column | ❌ | Missing from schema |
| `email_verification_tokens` table | ❌ | Missing |
| `password_reset_tokens` table | ❌ | Missing |
| `file_uploads` table | ❌ | Missing |
| `patients.profile_picture_id` FK | ❌ | Missing |
| `lab_results.upload_id` FK | ❌ | Missing |
| `students.email_verified` column | ❌ | Missing |
| DIU/version references removed | ❌ | Header still says "DIU Medical Center — Production Database v3" |

### Monorepo DB Folder Structure
| Item | Status |
|---|---|
| `db/schema.sql` | ❌ — SQL is at `src/main/resources/unimedicare_v3.sql` |
| `db/functions.sql` | ❌ |
| `db/triggers.sql` | ❌ |
| `db/seed.sql` | ❌ |
| `db/Dockerfile` | ❌ |

---

## Repo Structure — Plan vs Reality

### Plan Expected
```
uni-medicare/
├── backend/
├── db/
├── frontend/
├── docker-compose.yml
└── .env.example
```

### Reality
```
uni-medicare/           ← Spring Boot app IS the root
├── src/
├── pom.xml
├── docker-compose.yml  ← inside the app, not monorepo root
└── src/main/resources/unimedicare_v3.sql  ← buried here
```

### Docker Compose
| Item | Status | Notes |
|---|---|---|
| File exists | ✅ | |
| PostgreSQL | ❌ | Uses `mysql:8.0` |
| `.env` variables | ❌ | Hardcoded `root`/`root` credentials |
| Proper multi-stage `Dockerfile` for backend | ❌ | Uses `eclipse-temurin:21-jdk` + `mvnw spring-boot:run` (dev mode, slow) |
| `db/` init file mounting | ❌ | Mounts single SQL file from `src/main/resources/` |
| `depends_on` with health check | ✅ | MySQL health check present |
| `.env.example` file | ❌ | Missing |

---

## Frontend

| Item | Status |
|---|---|
| Next.js project | ❌ |
| Any frontend files | ❌ |
| `frontend/` folder | ❌ |

Nothing from `plan_frontend.md` has been generated.

---

## Bug List (Found During Review)

| # | Severity | Location | Bug |
|---|---|---|---|
| 1 | 🔴 High | `AppointmentController.getMy()` | Uses `user.getId()` as `patientId` for students — student ID ≠ patient ID, will return wrong or empty results |
| 2 | 🔴 High | `AuthService.login()` | Student password is never validated — any password logs in a student |
| 3 | 🔴 High | `AdminControllers.java` — staff endpoint | Returns raw `MedicalStaff` entity including the `password` hash in the JSON response |
| 4 | 🟡 Medium | `PrescriptionService.addLabTest()` | Does not create a `LabResult` row with `status=pending` — lab tech has nothing to update |
| 5 | 🟡 Medium | `AuditService.getAll()` | `findAll()` with no pagination — will load entire audit table into memory |
| 6 | 🟡 Medium | `NotificationService.create()` | Hardcodes `channel = "in_app"` — ignores `req.channel()` if it exists |
| 7 | 🟡 Medium | `VitalSign.java` comment | Says "MySQL calculates it" — wrong after PostgreSQL migration |
| 8 | 🟡 Medium | `application.properties` | JWT secret is hardcoded in the file, not read from environment variable |
| 9 | 🟡 Medium | `SecurityConfig.java` | Swagger endpoints not permitted — Swagger UI will be blocked once added |
| 10 | 🟡 Medium | `MedicalCenterApplication.java` | Class name should be `UniMedicareApplication` |
| 11 | 🟡 Medium | `BillingService` | `medicalCenterAccountId` hardcoded as `1` in the method body — should be a `@Value` config property |
| 12 | 🟢 Low | All list endpoints | No pagination (`Page<T>`) — fine for dev, problem in production |
| 13 | 🟢 Low | `ConsultationController.getMy()` | Student path uses `user.getId()` as `patientId` — same bug as appointments |

---

## Phase Checklist (For Prompting Opus)

| Phase | What to Fix | New Chat? |
|---|---|---|
| Phase 1 | PostgreSQL migration, rename DIU → uni-medicare, monorepo folder restructure, new docker-compose, `.env.example` | ✅ Yes |
| Phase 2 | Student `password` field + fix auth, DTO layer (prevent password leaks), fix student→patient ID lookup bug, `UniMedicareApplication` rename | ✅ Yes |
| Phase 3 | Email service, verification token, password reset — full flow | ✅ Yes |
| Phase 4 | File upload system — entity, service, controller, link to Patient and LabResult | ✅ Yes |
| Phase 5 | `MockPaymentGateway`, Swagger/OpenAPI config, add missing admin endpoints (`/students`, `/services`) | ✅ Yes |
| Phase 6 | Bug fixes — `addLabTest` missing LabResult creation, audit pagination, hardcoded config values, notification channel | ✅ Yes |
| Phase 7 | Frontend — Next.js generation using `plan_frontend.md` | ✅ Yes |
