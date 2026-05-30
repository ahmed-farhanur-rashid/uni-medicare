# uni-medicare — Backend Plan
> Feed this to your AI (Mimo) to generate the full Spring Boot application.
> Read plan_db.md first — all table and column names come from there.

---

## Project Overview

A university medical center management system backend. Clean monolith, package-by-feature, production-ready but not over-engineered. This is a portfolio and learning project — the code should be readable, well-commented, and follow Spring Boot best practices throughout.

**The goal:** Someone reading this codebase should be able to learn how a real Spring Boot application is structured.

---

## Stack

| Concern | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Security | Spring Security 6 + JWT (jjwt library) |
| Persistence | Spring Data JPA + Hibernate 6 |
| Database | PostgreSQL 16 |
| Build | Maven |
| Email | Spring Boot Mail + Mailtrap (dev) / SMTP (prod) |
| File Storage | Local filesystem (dev) / MinIO S3-compatible (prod) |
| Containerization | Docker + Docker Compose |
| API Docs | SpringDoc OpenAPI (Swagger UI at `/swagger-ui.html`) |
| Validation | Jakarta Bean Validation (`@Valid`, `@NotBlank`, etc.) |
| Mapping | MapStruct (entity ↔ DTO) |

---

## Monorepo Location

```
uni-medicare/
├── backend/           ← this Spring Boot app
│   ├── src/
│   ├── pom.xml
│   └── Dockerfile
├── db/
├── frontend/
├── docker-compose.yml
└── .env.example
```

---

## Package Structure

```
com.unimedicare
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   └── LoginResponse.java
│   └── emailverification/
│       ├── EmailVerificationService.java
│       └── EmailVerificationToken.java  (entity)
├── appointment/
│   ├── AppointmentController.java
│   ├── AppointmentService.java
│   ├── AppointmentRepository.java
│   ├── Appointment.java               (entity)
│   └── dto/
├── consultation/
├── vital/
├── prescription/
├── lab/
├── billing/
├── notification/
├── audit/
├── admin/
├── upload/
│   ├── FileUploadController.java
│   ├── FileUploadService.java
│   ├── FileUploadRepository.java
│   └── FileUpload.java                (entity)
└── shared/
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── JwtConfig.java
    │   └── OpenApiConfig.java
    ├── entity/
    │   └── BaseEntity.java            (optional shared fields)
    ├── exception/
    │   ├── GlobalExceptionHandler.java
    │   ├── ResourceNotFoundException.java
    │   ├── AccessDeniedException.java
    │   └── BusinessRuleException.java
    ├── security/
    │   ├── JwtUtil.java
    │   ├── JwtAuthFilter.java
    │   └── StudentValidityFilter.java
    └── util/
        └── SecurityContextUtil.java   (get current user from JWT)
```

---

## Maven Dependencies (`pom.xml`)

```xml
<!-- Spring Boot starters -->
<dependency>spring-boot-starter-web</dependency>
<dependency>spring-boot-starter-data-jpa</dependency>
<dependency>spring-boot-starter-security</dependency>
<dependency>spring-boot-starter-validation</dependency>
<dependency>spring-boot-starter-mail</dependency>

<!-- PostgreSQL driver -->
<dependency>postgresql (runtime)</dependency>

<!-- JWT -->
<dependency>io.jsonwebtoken:jjwt-api:0.12.x</dependency>
<dependency>io.jsonwebtoken:jjwt-impl:0.12.x (runtime)</dependency>
<dependency>io.jsonwebtoken:jjwt-jackson:0.12.x (runtime)</dependency>

<!-- MapStruct (DTO mapping) -->
<dependency>org.mapstruct:mapstruct:1.5.x</dependency>
<dependency>org.mapstruct:mapstruct-processor:1.5.x (provided)</dependency>

<!-- Lombok -->
<dependency>org.projectlombok:lombok (provided)</dependency>

<!-- OpenAPI / Swagger -->
<dependency>org.springdoc:springdoc-openapi-starter-webmvc-ui:2.x</dependency>
```

---

## Configuration (`application.yml`)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate   # NEVER create/update in prod — schema is managed by db/schema.sql
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

  mail:
    host: ${MAIL_HOST}
    port: ${MAIL_PORT}
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

app:
  jwt:
    secret: ${JWT_SECRET}
    expiration-ms: 86400000   # 24 hours
  upload:
    base-path: ${UPLOAD_BASE_PATH:/uploads}
    max-file-size-mb: 10
  medical-center-account-id: 1   # The university's own account in the accounts table
```

---

## Authentication

### How It Works
1. Student or staff sends `POST /api/auth/login` with `{ "eId": "...", "password": "..." }`
2. `AuthService` tries to find a student with that `student_id`, then a staff with that `medical_staff_id`
3. Validates bcrypt password
4. For students: checks `is_active = true` AND `expires_on >= today` — rejects with clear error if not
5. For staff: checks `is_active = true`
6. Returns a JWT containing: `id`, `role` (DOCTOR / NURSE / STUDENT / etc.), `type` (student or staff)

### JWT Structure (payload claims)
```json
{
  "sub": "12345",
  "type": "student",
  "role": "STUDENT",
  "iat": 1700000000,
  "exp": 1700086400
}
```

For staff, `role` will be `DOCTOR`, `NURSE`, `LAB_TECHNICIAN`, `RECEPTIONIST`, or `ADMIN`.

### JwtAuthFilter
- Runs on every request
- Reads `Authorization: Bearer <token>` header
- Validates token signature and expiry
- Loads a `UserDetails`-compatible principal and sets it in `SecurityContextHolder`
- This is how `@PreAuthorize` annotations later know who is calling

### StudentValidityFilter
- Runs after JwtAuthFilter
- If the authenticated user is a `student`, re-checks `is_active` and `expires_on` on every request
- This prevents a student who was deactivated mid-session from continuing to use the API
- Returns `403 Forbidden` with a clear message if the student is no longer valid

### Email Verification Flow
1. When a student logs in for the first time (or their email is unverified), system sends a verification email
2. Email contains a link: `GET /api/auth/verify-email?token=<uuid>`
3. Backend validates the token (not expired, not used), stamps `used_at`, marks the student as verified
4. Add an `email_verified` boolean column to `students` table — set to `false` on creation, `true` after verification

### Password Reset Flow
1. `POST /api/auth/forgot-password` with `{ "email": "..." }` — always returns 200 (don't reveal if email exists)
2. If email found, insert a `password_reset_tokens` row, send email with reset link
3. `POST /api/auth/reset-password` with `{ "token": "...", "newPassword": "..." }`
4. Validate token, update password hash, stamp `used_at`

---

## Security Configuration (`SecurityConfig.java`)

```
Public endpoints (no JWT required):
  POST /api/auth/login
  GET  /api/auth/verify-email
  POST /api/auth/forgot-password
  POST /api/auth/reset-password
  GET  /swagger-ui/**
  GET  /v3/api-docs/**

Everything else: requires valid JWT
Method-level security: enabled via @EnableMethodSecurity
```

### Role Hierarchy
Spring Security roles are set from the JWT `role` claim. Use `ROLE_` prefix internally:
- `ROLE_STUDENT`
- `ROLE_DOCTOR`
- `ROLE_NURSE`
- `ROLE_LAB_TECHNICIAN`
- `ROLE_RECEPTIONIST`
- `ROLE_ADMIN`

---

## REST API — All Endpoints

### Auth
```
POST   /api/auth/login                  → LoginResponse (JWT)
GET    /api/auth/verify-email           → 200 OK (query param: token)
POST   /api/auth/forgot-password        → 200 OK always
POST   /api/auth/reset-password         → 200 OK
```

### Appointments
```
GET    /api/appointments                → List (RECEPTIONIST, ADMIN)
GET    /api/appointments/my             → List (STUDENT, DOCTOR — own only)
POST   /api/appointments                → AppointmentResponse (STUDENT, RECEPTIONIST, NURSE)
PATCH  /api/appointments/{id}/status   → AppointmentResponse (RECEPTIONIST, ADMIN)
```

### Consultations
```
GET    /api/consultations/my            → List (STUDENT — own, DOCTOR — own)
POST   /api/consultations               → ConsultationResponse (NURSE, RECEPTIONIST)
PATCH  /api/consultations/{id}/notes   → ConsultationResponse (DOCTOR)
```

### Vital Signs
```
POST   /api/vitals/{consultId}          → VitalSignsResponse (NURSE)
GET    /api/vitals/{consultId}          → VitalSignsResponse (DOCTOR, ADMIN)
```

### Prescriptions
```
POST   /api/prescriptions               → PrescriptionResponse (DOCTOR)
GET    /api/prescriptions/{id}          → PrescriptionResponse (DOCTOR, NURSE, STUDENT — own only)
POST   /api/prescriptions/{id}/medicines    → (DOCTOR)
POST   /api/prescriptions/{id}/lab-tests   → (DOCTOR)
```

### Lab Results
```
GET    /api/lab-results/prescription/{prescriptionId}  → List (DOCTOR, LAB_TECHNICIAN)
PATCH  /api/lab-results/{resultId}                     → LabResultResponse (LAB_TECHNICIAN)
GET    /api/lab-results/my                             → List (STUDENT — own, no internal notes)
```

### Billing
```
GET    /api/billing/invoices/my                → List (STUDENT)
POST   /api/billing/invoices/{id}/pay          → PaymentResponse (STUDENT)
POST   /api/billing/invoices/{id}/line-items   → InvoiceResponse (RECEPTIONIST)
PATCH  /api/billing/invoices/{id}/status       → InvoiceResponse (RECEPTIONIST, ADMIN)
```

### Notifications
```
GET    /api/notifications/my            → List (ALL roles)
PATCH  /api/notifications/{id}/read    → 200 OK (ALL roles)
POST   /api/notifications               → NotificationResponse (ADMIN)
```

### Audit Logs
```
GET    /api/audit-logs                  → Paginated list (ADMIN only)
```

### File Uploads
```
POST   /api/uploads/profile-picture    → UploadResponse (STUDENT — own only)
GET    /api/uploads/{uploadId}         → File stream (authenticated users — access-controlled)
POST   /api/uploads/lab-result/{resultId}  → UploadResponse (LAB_TECHNICIAN)
```

### Admin
```
GET/POST/PUT/DELETE   /api/admin/departments    (ADMIN)
GET/POST/PUT/DELETE   /api/admin/roles          (ADMIN)
GET/POST/PUT/DELETE   /api/admin/staff          (ADMIN)
GET/POST/PUT/DELETE   /api/admin/schedules      (ADMIN)
GET/POST/PUT/DELETE   /api/admin/students       (ADMIN)
GET/POST/PUT/DELETE   /api/admin/services       (ADMIN)
```

---

## Service Layer — Detailed Notes

### AuthService
- Use `PasswordEncoder` (BCrypt) to validate passwords
- Never return the password hash in any response
- JWT is signed with an HS256 secret key from `app.jwt.secret`
- Keep token stateless — no session, no DB lookup per request (filter reads JWT directly)

### AppointmentService
- On booking: check student `is_active` and `expires_on` (business rule 1)
- Check that the target doctor has a schedule entry for the `day_of_week` of `scheduled_time` (business rule 2)
- Check for conflicts: is that doctor already booked at that time?

### ConsultationService
- On open: check the linked appointment's status is not `completed` or `cancelled` (business rule 3)
- Walk-in consultations have no appointment_id (null is valid)

### VitalService
- Just insert into `vital_signs`
- The invoice is auto-created by the DB trigger — do NOT create it here
- After saving, optionally send an in-app notification to the student

### PrescriptionService
- Check `can_prescribe = true` on the staff's role (business rule 4) — even though role also blocks it
- Create prescription + all child records (medicines, lab tests) in a single `@Transactional` method
- When lab tests are ordered, create corresponding `lab_results` rows with `result_status = 'pending'`

### LabResultService
- On update: check `result_status` is `pending` or `in_progress` (business rule 6)
- Lab technician can only set: `result_value`, `result_notes`, `result_status`, `resulted_at`
- If a PDF is uploaded, link `upload_id` to the result

### BillingService
- `payInvoice()`: calls `transfer_funds` PostgreSQL function via `SimpleJdbcCall` or a native `@Query`
- `addLineItem()`: calls `add_invoice_line_item` PostgreSQL function
- Students cannot pay more than their account balance (the DB function enforces this too, but validate in service layer first for better error messages)

### NotificationService
- `createNotification()`: inserts to DB + if channel is `email`, calls `EmailService` to send
- `markRead()`: stamps `read_at = NOW()`, sets `is_read = true`
- Always filter by `recipient_id` matching the current authenticated user

### AuditService
- Read-only. Just a repository query with pagination.
- Writes come from: DB triggers (for data changes) and Spring AOP `@AfterReturning` advice for:
  - Login events
  - Password changes
  - Invoice status changes
  - Student activation/deactivation via admin

### FileUploadService
- Validate MIME type: images (jpeg/png) for profile pictures, PDF for lab results
- Validate file size: max 10MB
- Generate a UUID filename: `UUID.randomUUID() + extension`
- Store under `{UPLOAD_BASE_PATH}/{file_type}/{stored_name}`
- Save metadata to `file_uploads` table
- For serving files: stream from disk with correct `Content-Type` header
- Access control: students can only fetch their own files; staff can fetch based on role

---

## Email Service

Use `JavaMailSender`. Create an `EmailService` class in `shared/util/` or a dedicated `email/` package.

### Email Templates (plain text or simple HTML)
1. **Email Verification** — subject: "Verify your uni-medicare email", body contains verification link
2. **Password Reset** — subject: "Reset your password", body contains reset link (expires in 1 hour)
3. **Appointment Confirmation** — sent to student after booking
4. **Lab Result Ready** — sent to student when lab result status becomes `completed`

### Dev Setup (Mailtrap)
```yaml
# application-dev.yml
spring:
  mail:
    host: sandbox.smtp.mailtrap.io
    port: 2525
    username: ${MAILTRAP_USERNAME}
    password: ${MAILTRAP_PASSWORD}
```
Mailtrap is a fake inbox — emails are "sent" but you see them in the Mailtrap dashboard. Free tier is enough.

### Prod Setup
Use any real SMTP: Gmail, SendGrid, AWS SES. Config is in `.env`.

---

## Mock Payment Gateway

Instead of Stripe or PayPal, build a simple internal mock that simulates a real payment flow. This teaches the pattern without external API complexity.

### What to build
A `MockPaymentGateway` service in `billing/` that:
1. Accepts `{ amount, studentId, description }`
2. Randomly succeeds (90%) or fails (10%) — simulating real-world failure rates
3. Returns a `PaymentGatewayResponse { success, gatewayTransactionId, message }`
4. On success, calls `BillingService.payInvoice()` which calls the `transfer_funds` DB function
5. On failure, returns a `402 Payment Required` with the gateway error message

This is realistic enough for a portfolio. The `transfer_funds` function is the actual transaction — the mock just wraps it with a "gateway" abstraction layer.

---

## Exception Handling (`GlobalExceptionHandler.java`)

Use `@RestControllerAdvice`. Handle:
- `ResourceNotFoundException` → `404 Not Found`
- `BusinessRuleException` → `422 Unprocessable Entity`
- `AccessDeniedException` → `403 Forbidden`
- `MethodArgumentNotValidException` → `400 Bad Request` with field-level error messages
- `DataIntegrityViolationException` → `409 Conflict` (e.g. duplicate email)
- Generic `Exception` → `500 Internal Server Error` (log the stack trace, return generic message)

All error responses follow a consistent shape:
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "message": "Student cannot book appointment: account is inactive",
  "path": "/api/appointments"
}
```

---

## AOP Audit Logging (`@AfterReturning`)

Create `AuditAspect.java` in `audit/`. Use `@Aspect` + `@AfterReturning` to intercept:
- `AuthService.login()` → log `LOGIN` action
- `AuthService.resetPassword()` → log `PASSWORD_RESET`
- `AdminService.deactivateStudent()` → log `STUDENT_DEACTIVATED`
- `BillingService.updateInvoiceStatus()` → log `INVOICE_STATUS_CHANGE`

This supplements the DB triggers (which handle row-level data changes) with application-level business event logging. A great Spring concept to understand.

---

## Business Rules Summary

| # | Rule | Enforced in |
|---|---|---|
| 1 | Student cannot book if `is_active=false` or `expires_on < today` | AppointmentService |
| 2 | Student cannot book a doctor with no schedule for that day | AppointmentService |
| 3 | Consultation cannot be opened for a `completed` or `cancelled` appointment | ConsultationService |
| 4 | Only staff with `can_prescribe=true` can create prescriptions | PrescriptionService |
| 5 | Invoice paid oldest-first; student cannot overpay | BillingService + DB function |
| 6 | Lab result can only be updated if status is `pending` or `in_progress` | LabResultService |
| 7 | Inactive staff cannot log in | AuthService |
| 8 | Students only see their own data (appointments, invoices, lab results, etc.) | Service layer checks |
| 9 | Staff see only what their role permits | @PreAuthorize annotations |

---

## Pagination & Filtering

For list endpoints that could return many rows, use Spring Data's `Pageable`:
- Default: 20 items per page
- Clients can pass `?page=0&size=20&sort=createdAt,desc`
- Return `Page<T>` wrapped in a consistent response envelope

---

## Docker Setup

### `backend/Dockerfile`
```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### `docker-compose.yml` (at monorepo root)
```yaml
version: '3.9'
services:
  db:
    build: ./db
    environment:
      POSTGRES_DB: unimedicare
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - db
    environment:
      DB_URL: jdbc:postgresql://db:5432/unimedicare
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      MAIL_HOST: ${MAIL_HOST}
      MAIL_PORT: ${MAIL_PORT}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
      UPLOAD_BASE_PATH: /uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## Learning Notes (Read These While Exploring the Code)

These are concepts you'll encounter in this codebase. Look them up when you see them — they're core Spring Boot knowledge:

| You'll see this | What it means |
|---|---|
| `@RestController` | Marks a class as an HTTP controller that returns JSON |
| `@Service` | Marks a class as a business logic component |
| `@Repository` | Marks a class as a data access component |
| `@Entity` | Maps a Java class to a database table |
| `@Transactional` | Wraps a method in a DB transaction — if it fails, everything rolls back |
| `@PreAuthorize("hasRole('DOCTOR')")` | Checks the JWT role before the method runs |
| `@Valid` | Triggers Bean Validation on a request body |
| `@AfterReturning` (AOP) | Runs code after a method successfully returns |
| `JwtAuthFilter extends OncePerRequestFilter` | Runs once per HTTP request to validate the JWT |
| `UserDetailsService` | Spring Security interface for loading user data |
| `PasswordEncoder` | BCrypt password hashing |
| `SimpleJdbcCall` | Calls a PostgreSQL function from Java |
| `MapStruct @Mapper` | Auto-generates code to convert Entity ↔ DTO |
| `Page<T>` | Spring Data's pagination wrapper |
| `@JdbcTypeCode(SqlTypes.JSON)` | Maps a JSONB column to a Java String or JsonNode |

---

## What NOT to Build

- No microservices — everything is one Spring Boot app
- No WebSocket / real-time — notifications are polled
- No Kafka / RabbitMQ — overkill for this scope
- No Redis caching — not needed at this scale
- No Kubernetes — Docker Compose is enough
- No GraphQL — REST is appropriate here
- No phone/SMS — email only
