# Uni Medicare

University medical center management system — full-stack monorepo with Spring Boot backend, Next.js frontend, and PostgreSQL database.

![Java](https://img.shields.io/badge/Java-17+-ED8B00?logo=java&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61dafb?logo=react&logoColor=black) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ed?logo=docker&logoColor=white) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.2, Spring Security 6, JWT (jjwt 0.12) |
| Database | PostgreSQL 16, PL/pgSQL functions, triggers |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand |
| API Docs | SpringDoc OpenAPI (Swagger UI) |
| Containerization | Docker + Docker Compose |

## Quick Start

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Clone and enter the project
cd uni-medicare

# 2. Copy environment template
cp .env.example .env

# 3. Start everything
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui/index.html |
| PostgreSQL | localhost:5432 |

## Seed Data Credentials

All passwords: `Password123!`

| Role | ID | Name |
|------|----|------|
| Student | 2021001 | Anika Tabassum |
| Doctor | 1001 | Dr. Sarah Ahmed |
| Nurse | 1003 | Nurse Fatima Rahman |
| Lab Tech | 1005 | Lab Tech Nadia Islam |
| Receptionist | 1007 | Receptionist Mina Das |
| Admin | 1009 | Admin Rashid Hasan |

## Project Structure

```
uni-medicare/
├── backend/                    Spring Boot application
│   ├── src/main/java/com/uni/medicare/
│   │   ├── auth/               JWT login, email verification, password reset
│   │   ├── appointment/        Booking, scheduling, conflict detection
│   │   ├── consultation/       Clinical consultations, notes
│   │   ├── vital/              Vital signs recording (BP, pulse, BMI)
│   │   ├── prescription/       Prescriptions, lab test orders
│   │   ├── lab/                Lab results management
│   │   ├── billing/            Invoices, payments, mock gateway
│   │   ├── notification/       In-app notifications
│   │   ├── audit/              AOP-based audit logging
│   │   ├── admin/              CRUD for students, staff, departments, services
│   │   ├── upload/             File uploads (profile pictures, lab PDFs)
│   │   └── shared/             Config, DTOs, entities, security, email
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                   Next.js application
│   ├── src/app/(dashboard)/    Role-based pages (student, doctor, nurse, etc.)
│   ├── src/components/ui/      Reusable UI components
│   ├── src/lib/api.ts          Axios API client with all endpoints
│   ├── src/store/auth.ts       Zustand auth store
│   └── Dockerfile
├── db/                         PostgreSQL database
│   ├── schema.sql              24 tables
│   ├── functions.sql           transfer_funds, add_invoice_line_item
│   ├── triggers.sql            Auto timestamps, invoice generation, audit
│   └── seed.sql                Full development dataset
├── docker-compose.yml
└── .env.example
```

## Backend — 9 Systems

| # | System | Key Features |
|---|--------|-------------|
| 1 | **Appointments** | Book with schedule validation, conflict detection, status management |
| 2 | **Consultations** | Open from appointments or walk-ins, doctor notes |
| 3 | **Vitals** | Record BP/pulse/temp/height/weight, auto BMI calculation, auto invoice generation |
| 4 | **Prescriptions** | Doctor-only creation, lab test orders with auto LabResult creation |
| 5 | **Lab Results** | Pending → in_progress → completed workflow, PDF upload |
| 6 | **Billing** | PostgreSQL functions for fund transfer, mock payment gateway (90/10), invoice line items |
| 7 | **Notifications** | In-app + email channels, mark as read |
| 8 | **Audit** | AOP logging for login, payments, status changes; DB triggers for student status |
| 9 | **Admin** | Full CRUD for students, staff, departments, roles, services, schedules |

## Backend — Business Rules

1. Student must be active and enrollment not expired to book appointments
2. Doctor must have a schedule entry for the requested day
3. Consultation cannot be opened for completed/cancelled appointments
4. Only doctors (`can_prescribe=true`) can create prescriptions
5. Invoice payment uses PostgreSQL `transfer_funds()` — rejects on insufficient funds
6. Lab results can only be updated when status is `pending` or `in_progress`
7. Inactive staff cannot log in
8. Students only see their own data
9. All endpoints enforce role-based access via `@PreAuthorize`

## Frontend — Role Dashboards

| Role | Pages |
|------|-------|
| **Student** | Dashboard, Appointments, Consultations, Prescriptions, Lab Results, Invoices |
| **Doctor** | Dashboard, My Consultations, My Appointments |
| **Nurse** | Dashboard, Consultations, Record Vitals |
| **Receptionist** | Dashboard, Appointments, Billing |
| **Lab Technician** | Dashboard, Lab Results |
| **Admin** | Dashboard, Students, Staff, Departments, Services, Audit Logs |

## API Endpoints (35)

<details>
<summary>Auth (4)</summary>

- `POST /api/auth/login` — Public
- `GET /api/auth/verify-email?token=` — Public
- `POST /api/auth/forgot-password` — Public
- `POST /api/auth/reset-password` — Public
</details>

<details>
<summary>Appointments (4)</summary>

- `GET /api/appointments` — RECEPTIONIST, ADMIN
- `GET /api/appointments/my` — STUDENT, DOCTOR
- `POST /api/appointments` — STUDENT, RECEPTIONIST, NURSE
- `PATCH /api/appointments/{id}/status` — RECEPTIONIST, ADMIN
</details>

<details>
<summary>Consultations (3)</summary>

- `GET /api/consultations/my` — STUDENT, DOCTOR
- `POST /api/consultations` — NURSE, RECEPTIONIST
- `PATCH /api/consultations/{id}/notes` — DOCTOR
</details>

<details>
<summary>Vitals (2)</summary>

- `POST /api/vitals/{consultId}` — NURSE
- `GET /api/vitals/{consultId}` — DOCTOR, ADMIN
</details>

<details>
<summary>Prescriptions (3)</summary>

- `POST /api/prescriptions` — DOCTOR
- `GET /api/prescriptions/{id}` — DOCTOR, NURSE, STUDENT, ADMIN
- `POST /api/prescriptions/{id}/lab-tests` — DOCTOR
</details>

<details>
<summary>Lab Results (3)</summary>

- `GET /api/lab-results/prescription/{id}` — DOCTOR, LAB_TECHNICIAN
- `PATCH /api/lab-results/{id}` — LAB_TECHNICIAN
- `GET /api/lab-results/my` — STUDENT
</details>

<details>
<summary>Billing (4)</summary>

- `GET /api/billing/invoices/my` — STUDENT
- `POST /api/billing/invoices/{id}/pay` — STUDENT
- `POST /api/billing/invoices/{id}/line-items` — RECEPTIONIST
- `PATCH /api/billing/invoices/{id}/status` — RECEPTIONIST, ADMIN
</details>

<details>
<summary>Notifications (3)</summary>

- `GET /api/notifications/my` — All authenticated
- `PATCH /api/notifications/{id}/read` — All authenticated
- `POST /api/notifications` — ADMIN
</details>

<details>
<summary>Admin (6 groups)</summary>

- `CRUD /api/admin/students` — ADMIN
- `CRUD /api/admin/staff` — ADMIN
- `CRUD /api/admin/departments` — ADMIN
- `CRUD /api/admin/roles` — ADMIN
- `CRUD /api/admin/services` — ADMIN
- `CRUD /api/admin/schedules` — ADMIN
</details>

<details>
<summary>Uploads (3)</summary>

- `POST /api/uploads/profile-picture` — STUDENT
- `POST /api/uploads/lab-result/{id}` — LAB_TECHNICIAN
- `GET /api/uploads/{id}` — Authenticated
</details>

<details>
<summary>Audit (1)</summary>

- `GET /api/audit-logs` — ADMIN (paginated)
</details>

## Database

24 tables with PostgreSQL-native features:
- **Generated columns:** `expires_on` (students), `bmi` (vital_signs), `total_price` (invoice_line_items)
- **PL/pgSQL functions:** `transfer_funds()`, `add_invoice_line_item()`
- **Triggers:** Auto `updated_at`, invoice generation on vitals, appointment completion on consultation, student status audit
- **JSONB columns:** Audit log old/new values

## License

MIT
