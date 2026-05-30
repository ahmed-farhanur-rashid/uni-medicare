# uni-medicare — Database Plan
> Feed this to your AI (Mimo) to generate the PostgreSQL schema, migrations, and seed data.
> This is the source of truth for all table structures. The backend plan references this.

---

## Overview

- **Engine:** PostgreSQL 16
- **Location in monorepo:** `db/`
- **Files to generate:**
  - `db/schema.sql` — full schema (tables, constraints, generated columns)
  - `db/functions.sql` — PL/pgSQL functions (replaces MySQL stored procedures)
  - `db/triggers.sql` — all trigger functions + trigger bindings
  - `db/seed.sql` — realistic sample data for development
- Docker mounts these files and runs them in order on first start

---

## Key PostgreSQL Differences from MySQL (Important for Generation)

| MySQL | PostgreSQL equivalent |
|---|---|
| `AUTO_INCREMENT` | `SERIAL` or `GENERATED ALWAYS AS IDENTITY` |
| `DATETIME` | `TIMESTAMP` |
| `ON UPDATE CURRENT_TIMESTAMP` | Trigger function using `NOW()` |
| `DELIMITER $$` / stored procedures | `CREATE OR REPLACE FUNCTION ... LANGUAGE plpgsql` |
| `SIGNAL SQLSTATE '45000'` | `RAISE EXCEPTION 'message'` |
| `JSON_OBJECT('k', v)` | `jsonb_build_object('k', v)` |
| `JSON` column type | `JSONB` (binary JSON — faster, indexable) |
| `YEAR` type | `SMALLINT` |
| `TINYINT` | `SMALLINT` |
| `BOOLEAN DEFAULT TRUE` | `BOOLEAN NOT NULL DEFAULT TRUE` (same) |
| `LAST_INSERT_ID()` | `RETURNING id` or `currval()` |
| `LIMIT 1` in UPDATE | Not directly supported — use subquery or CTE |
| `CHECK` inline constraints | Same syntax — fully supported |
| Generated columns `GENERATED ALWAYS AS (...) STORED` | Same syntax — fully supported in PG 12+ |

---

## Schema

### accounts
Holds the financial balance for students and the medical center itself.

```sql
CREATE TABLE accounts (
    account_id  SERIAL PRIMARY KEY,
    balance     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);
```
> `updated_at` is maintained by a shared trigger function `set_updated_at()` — see Triggers section.

---

### students
Core user table for students. `student_id` is their university ID (manual, not auto).

```sql
CREATE TABLE students (
    student_id  INT PRIMARY KEY,  -- university-assigned ID, not auto
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  UNIQUE,
    phone       VARCHAR(15),
    password    VARCHAR(255)  NOT NULL,              -- bcrypt hash
    issued_on   DATE          NOT NULL,
    expires_on  DATE GENERATED ALWAYS AS (issued_on + INTERVAL '4 years') STORED,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    account_id  INT           NOT NULL REFERENCES accounts(account_id),
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT NOW()
);
```
> `expires_on` is a generated column — never set it manually. Mark `insertable=false, updatable=false` in JPA.
> `password` column was missing from the original schema — added here. Students log in too.

---

### email_verification_tokens
Used for verifying student email addresses on first login or when email is changed.

```sql
CREATE TABLE email_verification_tokens (
    token_id    SERIAL PRIMARY KEY,
    student_id  INT          NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```
> Token is a UUID string. Expires in 24 hours. Once used, `used_at` is stamped and token is invalid.

---

### password_reset_tokens
Allows students and staff to reset their password via email link.

```sql
CREATE TABLE password_reset_tokens (
    token_id    SERIAL PRIMARY KEY,
    user_type   VARCHAR(10)  NOT NULL CHECK (user_type IN ('student', 'staff')),
    user_id     INT          NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

### patients
Medical profile — one-to-one with students.

```sql
CREATE TABLE patients (
    patient_id              SERIAL PRIMARY KEY,
    student_id              INT     NOT NULL UNIQUE REFERENCES students(student_id),
    date_of_birth           DATE    NOT NULL,
    bloodgroup              VARCHAR(5),
    sex                     CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    allergies               TEXT,
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    profile_picture_id      INT     REFERENCES file_uploads(upload_id) ON DELETE SET NULL
);
```
> `profile_picture_id` references `file_uploads` — see that table below.

---

### file_uploads
Central table for all uploaded files (profile pictures, lab result PDFs).

```sql
CREATE TABLE file_uploads (
    upload_id       SERIAL PRIMARY KEY,
    uploader_type   VARCHAR(10)  NOT NULL CHECK (uploader_type IN ('student', 'staff')),
    uploader_id     INT          NOT NULL,
    file_type       VARCHAR(20)  NOT NULL CHECK (file_type IN ('profile_picture', 'lab_result_pdf', 'other')),
    original_name   VARCHAR(255) NOT NULL,
    stored_name     VARCHAR(255) NOT NULL UNIQUE,  -- UUID-based filename on disk
    mime_type       VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT       NOT NULL,
    storage_path    VARCHAR(500) NOT NULL,          -- relative path under /uploads/
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
```
> Files are stored on the server filesystem (or MinIO in production). This table just tracks metadata.
> `stored_name` is a UUID to prevent filename collisions and path guessing.

---

### histories
Medical history entries for a patient.

```sql
CREATE TABLE histories (
    history_id        SERIAL PRIMARY KEY,
    patient_id        INT          NOT NULL REFERENCES patients(patient_id),
    condition_details VARCHAR(255),
    condition_status  VARCHAR(50),
    year_diagnosed    SMALLINT,
    recorded_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);
```
> MySQL `YEAR` type becomes `SMALLINT` in PostgreSQL.

---

### departments

```sql
CREATE TABLE departments (
    department_id  SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,
    description    VARCHAR(255)
);
```

---

### medical_staff_roles

```sql
CREATE TABLE medical_staff_roles (
    role_id       INT PRIMARY KEY,  -- manually seeded: 1=DOCTOR, 2=NURSE, etc.
    role_name     VARCHAR(100) NOT NULL,
    can_prescribe BOOLEAN      NOT NULL
);
```
> Seed values:
> - 1 = DOCTOR, can_prescribe = true
> - 2 = NURSE, can_prescribe = false
> - 3 = LAB_TECHNICIAN, can_prescribe = false
> - 4 = RECEPTIONIST, can_prescribe = false
> - 5 = ADMIN, can_prescribe = false

---

### medical_staffs

```sql
CREATE TABLE medical_staffs (
    medical_staff_id INT PRIMARY KEY,  -- manually assigned staff ID
    role_id          INT          NOT NULL REFERENCES medical_staff_roles(role_id),
    department_id    INT          REFERENCES departments(department_id),
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) UNIQUE,
    phone            VARCHAR(15),
    password         VARCHAR(255) NOT NULL,  -- bcrypt hash
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

### staff_schedules

```sql
CREATE TABLE staff_schedules (
    schedule_id      SERIAL PRIMARY KEY,
    medical_staff_id INT      NOT NULL REFERENCES medical_staffs(medical_staff_id),
    day_of_week      SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
    start_time       TIME     NOT NULL,
    end_time         TIME     NOT NULL,
    UNIQUE (medical_staff_id, day_of_week)
);
```

---

### appointments

```sql
CREATE TABLE appointments (
    appointment_id      SERIAL PRIMARY KEY,
    patient_id          INT          NOT NULL REFERENCES patients(patient_id),
    medical_staff_id    INT          NOT NULL REFERENCES medical_staffs(medical_staff_id),
    scheduled_time      TIMESTAMP    NOT NULL,
    reason              TEXT,
    status              VARCHAR(20)  NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show')),
    cancellation_reason VARCHAR(255),
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

---

### consultations

```sql
CREATE TABLE consultations (
    consult_id       SERIAL PRIMARY KEY,
    patient_id       INT       NOT NULL REFERENCES patients(patient_id),
    medical_staff_id INT       NOT NULL REFERENCES medical_staffs(medical_staff_id),
    appointment_id   INT       REFERENCES appointments(appointment_id),  -- NULL for walk-ins
    consult_time     TIMESTAMP NOT NULL DEFAULT NOW(),
    notes            TEXT
);
```

---

### vital_signs

```sql
CREATE TABLE vital_signs (
    consult_id          INT PRIMARY KEY REFERENCES consultations(consult_id),
    bp                  VARCHAR(20),
    pulse               INT,
    temp                NUMERIC(4,1),
    respiratory_rate    INT,
    oxygen_saturation   NUMERIC(5,2),
    blood_glucose       NUMERIC(6,2),
    weight              NUMERIC(5,2),
    height              NUMERIC(5,2),
    bmi                 NUMERIC(4,2) GENERATED ALWAYS AS (
                            CASE
                                WHEN height IS NOT NULL AND height > 0 AND weight IS NOT NULL
                                THEN ROUND(weight / ((height / 100.0) * (height / 100.0)), 2)
                                ELSE NULL
                            END
                        ) STORED
);
```
> `bmi` is generated — mark `insertable=false, updatable=false` in JPA.

---

### services
Fee catalog for medical services.

```sql
CREATE TABLE services (
    service_id   SERIAL PRIMARY KEY,
    service_name VARCHAR(150)   NOT NULL,
    category     VARCHAR(50)    NOT NULL CHECK (category IN ('consultation','lab','procedure','other')),
    unit_price   NUMERIC(10,2)  NOT NULL,
    description  VARCHAR(255),
    is_active    BOOLEAN        NOT NULL DEFAULT TRUE
);
```

---

### prescriptions

```sql
CREATE TABLE prescriptions (
    prescription_id   SERIAL PRIMARY KEY,
    consult_id        INT       NOT NULL REFERENCES consultations(consult_id),
    prescription_date TIMESTAMP NOT NULL DEFAULT NOW(),
    chief_complaint   TEXT,
    diagnosis         TEXT,
    follow_up_date    DATE
);
```

---

### prescription_medicines

```sql
CREATE TABLE prescription_medicines (
    medicine_id     SERIAL PRIMARY KEY,
    prescription_id INT          NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_name   VARCHAR(100) NOT NULL,
    dosage          VARCHAR(50),
    frequency       VARCHAR(50),
    days            INT,
    instructions    VARCHAR(255)
);
```

---

### lab_test_catalog

```sql
CREATE TABLE lab_test_catalog (
    catalog_id   SERIAL PRIMARY KEY,
    test_name    VARCHAR(150)  NOT NULL UNIQUE,
    description  VARCHAR(255),
    normal_range VARCHAR(100),
    unit         VARCHAR(50),
    service_id   INT           REFERENCES services(service_id)
);
```

---

### prescription_lab_tests

```sql
CREATE TABLE prescription_lab_tests (
    lab_test_id     SERIAL PRIMARY KEY,
    prescription_id INT          NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    catalog_id      INT          REFERENCES lab_test_catalog(catalog_id),
    lab_test_name   VARCHAR(100)  -- free-text fallback if not in catalog
);
```

---

### lab_results

```sql
CREATE TABLE lab_results (
    result_id      SERIAL PRIMARY KEY,
    lab_test_id    INT          NOT NULL REFERENCES prescription_lab_tests(lab_test_id),
    performed_by   INT          REFERENCES medical_staffs(medical_staff_id),
    result_value   VARCHAR(255),
    result_notes   TEXT,
    result_status  VARCHAR(20)  NOT NULL DEFAULT 'pending'
                   CHECK (result_status IN ('pending','in_progress','completed','cancelled')),
    resulted_at    TIMESTAMP,
    upload_id      INT          REFERENCES file_uploads(upload_id) ON DELETE SET NULL,  -- lab result PDF
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);
```
> `upload_id` links to an uploaded PDF for this lab result.

---

### transactions

```sql
CREATE TABLE transactions (
    transaction_id   SERIAL PRIMARY KEY,
    account_id       INT           NOT NULL REFERENCES accounts(account_id),
    trans_type       VARCHAR(32),
    amount           NUMERIC(10,2) NOT NULL,
    transaction_date TIMESTAMP     NOT NULL DEFAULT NOW(),
    reference_note   VARCHAR(255)
);
```

---

### invoices

```sql
CREATE TABLE invoices (
    invoice_id         SERIAL PRIMARY KEY,
    invoice_date       TIMESTAMP     NOT NULL DEFAULT NOW(),
    total_amount       NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    transaction_status VARCHAR(20)   NOT NULL DEFAULT 'pending'
                       CHECK (transaction_status IN ('pending','paid','waived','cancelled')),
    consult_id         INT           NOT NULL REFERENCES consultations(consult_id),
    student_id         INT           NOT NULL REFERENCES students(student_id),
    transaction_id     INT           REFERENCES transactions(transaction_id) ON DELETE SET NULL,
    notes              TEXT,
    updated_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);
```

---

### invoice_line_items

```sql
CREATE TABLE invoice_line_items (
    line_item_id  SERIAL PRIMARY KEY,
    invoice_id    INT           NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    service_id    INT           REFERENCES services(service_id),
    description   VARCHAR(255)  NOT NULL,
    quantity      INT           NOT NULL DEFAULT 1,
    unit_price    NUMERIC(10,2) NOT NULL,
    total_price   NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
```
> `total_price` is generated — mark `insertable=false, updatable=false` in JPA.

---

### notifications

```sql
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    recipient_type  VARCHAR(20)  NOT NULL CHECK (recipient_type IN ('student','staff')),
    recipient_id    INT          NOT NULL,
    title           VARCHAR(150) NOT NULL,
    message         TEXT         NOT NULL,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    channel         VARCHAR(20)  NOT NULL DEFAULT 'in_app'
                    CHECK (channel IN ('in_app','email','sms')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMP
);
```

---

### audit_logs

```sql
CREATE TABLE audit_logs (
    log_id      SERIAL PRIMARY KEY,
    actor_type  VARCHAR(20)  NOT NULL CHECK (actor_type IN ('student','staff','system')),
    actor_id    INT          NOT NULL,
    action      VARCHAR(100) NOT NULL,
    table_name  VARCHAR(100),
    record_id   INT,
    old_value   JSONB,
    new_value   JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```
> `JSONB` instead of `JSON` — faster, indexable. Use `@JdbcTypeCode(SqlTypes.JSON)` in JPA.

---

## Trigger Functions (PL/pgSQL)

### Shared: set_updated_at()
Replaces MySQL's `ON UPDATE CURRENT_TIMESTAMP`. Attach to any table that has `updated_at`.

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Attach to: accounts, students, medical_staffs, appointments, invoices
CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- (repeat for each table)
```

---

### generate_invoice_after_vitals
Creates a pending invoice automatically when a nurse records vitals.

```sql
CREATE OR REPLACE FUNCTION fn_generate_invoice_after_vitals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_student_id INT;
BEGIN
    SELECT st.student_id INTO v_student_id
    FROM consultations c
    JOIN patients  p  ON c.patient_id = p.patient_id
    JOIN students  st ON p.student_id = st.student_id
    WHERE c.consult_id = NEW.consult_id;

    INSERT INTO invoices (total_amount, transaction_status, consult_id, student_id)
    VALUES (0.00, 'pending', NEW.consult_id, v_student_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_invoice_after_vitals
    AFTER INSERT ON vital_signs
    FOR EACH ROW EXECUTE FUNCTION fn_generate_invoice_after_vitals();
```

---

### complete_appointment_on_consult
Marks the appointment as completed when a consultation is opened for it.

```sql
CREATE OR REPLACE FUNCTION fn_complete_appointment_on_consult()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.appointment_id IS NOT NULL THEN
        UPDATE appointments
        SET status = 'completed', updated_at = NOW()
        WHERE appointment_id = NEW.appointment_id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_complete_appointment_on_consult
    AFTER INSERT ON consultations
    FOR EACH ROW EXECUTE FUNCTION fn_complete_appointment_on_consult();
```

---

### audit_student_status_change
Writes to audit_logs when a student's `is_active` flag changes.

```sql
CREATE OR REPLACE FUNCTION fn_audit_student_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.is_active IS DISTINCT FROM NEW.is_active THEN
        INSERT INTO audit_logs (actor_type, actor_id, action, table_name, record_id, old_value, new_value)
        VALUES (
            'system', 0, 'STATUS_CHANGE', 'students', NEW.student_id,
            jsonb_build_object('is_active', OLD.is_active),
            jsonb_build_object('is_active', NEW.is_active)
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_audit_student_status_change
    AFTER UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION fn_audit_student_status_change();
```

---

## PL/pgSQL Functions (Replaces Stored Procedures)

### transfer_funds
Deducts from student account, credits the medical center, marks oldest pending invoice as paid.

```sql
CREATE OR REPLACE FUNCTION transfer_funds(
    p_sender_student_id         INT,
    p_medical_center_account_id INT,
    p_amount                    NUMERIC(10,2)
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_student_account_id INT;
    v_student_balance    NUMERIC(10,2);
    v_transaction_id     INT;
    v_invoice_id         INT;
BEGIN
    SELECT account_id INTO v_student_account_id
    FROM students WHERE student_id = p_sender_student_id;

    SELECT balance INTO v_student_balance
    FROM accounts WHERE account_id = v_student_account_id
    FOR UPDATE;

    IF v_student_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    UPDATE accounts SET balance = balance - p_amount WHERE account_id = v_student_account_id;
    UPDATE accounts SET balance = balance + p_amount WHERE account_id = p_medical_center_account_id;

    INSERT INTO transactions (account_id, trans_type, amount)
    VALUES (v_student_account_id, 'Made Payment', p_amount)
    RETURNING transaction_id INTO v_transaction_id;

    INSERT INTO transactions (account_id, trans_type, amount)
    VALUES (p_medical_center_account_id, 'Received Payment', p_amount);

    -- Pay the oldest pending invoice
    SELECT invoice_id INTO v_invoice_id
    FROM invoices
    WHERE student_id = p_sender_student_id AND transaction_status = 'pending'
    ORDER BY invoice_date ASC
    LIMIT 1;

    UPDATE invoices
    SET transaction_status = 'paid', transaction_id = v_transaction_id
    WHERE invoice_id = v_invoice_id;
END;
$$;
```

---

### add_invoice_line_item
Inserts a line item and recalculates the invoice total.

```sql
CREATE OR REPLACE FUNCTION add_invoice_line_item(
    p_invoice_id  INT,
    p_service_id  INT,
    p_description VARCHAR(255),
    p_quantity    INT,
    p_unit_price  NUMERIC(10,2)
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO invoice_line_items (invoice_id, service_id, description, quantity, unit_price)
    VALUES (p_invoice_id, p_service_id, p_description, p_quantity, p_unit_price);

    UPDATE invoices
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM invoice_line_items
        WHERE invoice_id = p_invoice_id
    )
    WHERE invoice_id = p_invoice_id;
END;
$$;
```

---

## Seed Data Notes (`db/seed.sql`)

Generate realistic seed data covering:

- 1 medical center account (account_id = 1, balance = 100000.00)
- 5 departments: General Medicine, Cardiology, Laboratory, Emergency, Administration
- 5 staff roles (as listed in medical_staff_roles section)
- 10 medical staff (2 doctors, 2 nurses, 2 lab techs, 2 receptionists, 1 admin, 1 super admin)
- Staff schedules: each doctor/nurse has 5 days/week coverage
- 20 students with accounts, patients, and histories
- 10 services in the catalog (consultation fee, blood test, urine test, ECG, X-ray, etc.)
- 10 lab tests in lab_test_catalog linked to services
- Sample appointments, consultations, prescriptions, lab results, invoices
- All passwords are bcrypt hash of `"Password123!"` for seed data

---

## Docker Setup (`db/Dockerfile` + init order)

```dockerfile
# db/Dockerfile
FROM postgres:16-alpine
COPY schema.sql      /docker-entrypoint-initdb.d/01_schema.sql
COPY functions.sql   /docker-entrypoint-initdb.d/02_functions.sql
COPY triggers.sql    /docker-entrypoint-initdb.d/03_triggers.sql
COPY seed.sql        /docker-entrypoint-initdb.d/04_seed.sql
```

PostgreSQL runs init scripts in alphabetical order on first boot. The numbering ensures correct execution order.

---

## Notes for JPA Mapping (Backend Reference)

| Column | Table | JPA annotation |
|---|---|---|
| `expires_on` | `students` | `@Column(insertable=false, updatable=false)` |
| `bmi` | `vital_signs` | `@Column(insertable=false, updatable=false)` |
| `total_price` | `invoice_line_items` | `@Column(insertable=false, updatable=false)` |
| `old_value`, `new_value` | `audit_logs` | `@JdbcTypeCode(SqlTypes.JSON)` + `String` or `JsonNode` |
| `transfer_funds` | — | `SimpleJdbcCall` or native `CALL` query |
| `add_invoice_line_item` | — | `SimpleJdbcCall` or native `CALL` query |
