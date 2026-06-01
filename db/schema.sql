-- =================================================================
--  Uni Medicare — PostgreSQL Schema
--  PostgreSQL 16+
-- =================================================================

-- -----------------------------------------------------------------
--  ACCOUNTS
-- -----------------------------------------------------------------
CREATE TABLE accounts (
    account_id  SERIAL PRIMARY KEY,
    balance     NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  STUDENTS
-- -----------------------------------------------------------------
CREATE TABLE students (
    student_id      INT PRIMARY KEY,              -- university-assigned ID, not auto
    name            VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  UNIQUE,
    phone           VARCHAR(15),
    password        VARCHAR(255)  NOT NULL,        -- bcrypt hash
    issued_on       DATE          NOT NULL,
    expires_on      DATE GENERATED ALWAYS AS (issued_on + INTERVAL '4 years') STORED,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    email_verified  BOOLEAN       NOT NULL DEFAULT FALSE,
    account_id      INT           NOT NULL REFERENCES accounts(account_id),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  EMAIL VERIFICATION TOKENS
-- -----------------------------------------------------------------
CREATE TABLE email_verification_tokens (
    token_id    SERIAL PRIMARY KEY,
    student_id  INT          NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  PASSWORD RESET TOKENS
-- -----------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    token_id    SERIAL PRIMARY KEY,
    user_type   VARCHAR(10)  NOT NULL CHECK (user_type IN ('student', 'staff')),
    user_id     INT          NOT NULL,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    used_at     TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  FILE UPLOADS
-- -----------------------------------------------------------------
CREATE TABLE file_uploads (
    upload_id       SERIAL PRIMARY KEY,
    uploader_type   VARCHAR(10)  NOT NULL CHECK (uploader_type IN ('student', 'staff')),
    uploader_id     INT          NOT NULL,
    file_type       VARCHAR(20)  NOT NULL CHECK (file_type IN ('profile_picture', 'lab_result_pdf', 'other')),
    original_name   VARCHAR(255) NOT NULL,
    stored_name     VARCHAR(255) NOT NULL UNIQUE,
    mime_type       VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT       NOT NULL,
    storage_path    VARCHAR(500) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  PATIENTS  (one-to-one with students)
-- -----------------------------------------------------------------
CREATE TABLE patients (
    patient_id              SERIAL PRIMARY KEY,
    student_id              INT     NOT NULL UNIQUE REFERENCES students(student_id),
    date_of_birth           DATE    NOT NULL,
    bloodgroup              VARCHAR(5),
    sex                     VARCHAR(1) CHECK (sex IN ('M', 'F', 'O')),
    allergies               TEXT,
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    profile_picture_id      INT     REFERENCES file_uploads(upload_id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------
--  MEDICAL HISTORIES
-- -----------------------------------------------------------------
CREATE TABLE histories (
    history_id        SERIAL PRIMARY KEY,
    patient_id        INT          NOT NULL REFERENCES patients(patient_id),
    condition_details VARCHAR(255),
    condition_status  VARCHAR(50),
    year_diagnosed    INTEGER,
    recorded_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  DEPARTMENTS
-- -----------------------------------------------------------------
CREATE TABLE departments (
    department_id  SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL UNIQUE,
    description    VARCHAR(255)
);

-- -----------------------------------------------------------------
--  MEDICAL STAFF ROLES
-- -----------------------------------------------------------------
CREATE TABLE medical_staff_roles (
    role_id       INT PRIMARY KEY,               -- manually seeded
    role_name     VARCHAR(100) NOT NULL,
    can_prescribe BOOLEAN      NOT NULL
);

-- -----------------------------------------------------------------
--  MEDICAL STAFFS
-- -----------------------------------------------------------------
CREATE TABLE medical_staffs (
    medical_staff_id INT PRIMARY KEY,             -- manually assigned staff ID
    role_id          INT          NOT NULL REFERENCES medical_staff_roles(role_id),
    department_id    INT          REFERENCES departments(department_id),
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(150) UNIQUE,
    phone            VARCHAR(15),
    specialty        VARCHAR(100),
    password         VARCHAR(255) NOT NULL,       -- bcrypt hash
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  STAFF SCHEDULES
-- -----------------------------------------------------------------
CREATE TABLE staff_schedules (
    schedule_id      SERIAL PRIMARY KEY,
    medical_staff_id INT      NOT NULL REFERENCES medical_staffs(medical_staff_id),
    day_of_week      INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
    start_time       TIME     NOT NULL,
    end_time         TIME     NOT NULL,
    UNIQUE (medical_staff_id, day_of_week)
);

-- -----------------------------------------------------------------
--  DEPARTMENT SCHEDULES
-- -----------------------------------------------------------------
CREATE TABLE department_schedules (
    schedule_id            SERIAL PRIMARY KEY,
    department_id          INT         NOT NULL REFERENCES departments(department_id),
    slot_duration_minutes  INT         NOT NULL DEFAULT 20,
    start_time             TIME        NOT NULL DEFAULT '08:00',
    end_time               TIME        NOT NULL DEFAULT '17:00',
    break_start            TIME        NOT NULL DEFAULT '13:00',
    break_end              TIME        NOT NULL DEFAULT '13:30',
    is_bookable            BOOLEAN     NOT NULL DEFAULT TRUE,
    updated_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (department_id)
);

-- -----------------------------------------------------------------
--  APPOINTMENTS
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
--  CONSULTATIONS
-- -----------------------------------------------------------------
CREATE TABLE consultations (
    consult_id       SERIAL PRIMARY KEY,
    patient_id       INT       NOT NULL REFERENCES patients(patient_id),
    medical_staff_id INT       NOT NULL REFERENCES medical_staffs(medical_staff_id),
    appointment_id   INT       REFERENCES appointments(appointment_id),  -- NULL for walk-ins
    consult_time     TIMESTAMP NOT NULL DEFAULT NOW(),
    notes            TEXT
);

-- -----------------------------------------------------------------
--  VITAL SIGNS
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
--  SERVICE / FEE CATALOG
-- -----------------------------------------------------------------
CREATE TABLE services (
    service_id   SERIAL PRIMARY KEY,
    service_name VARCHAR(150)   NOT NULL,
    category     VARCHAR(50)    NOT NULL CHECK (category IN ('consultation','lab','procedure','other')),
    unit_price   NUMERIC(10,2)  NOT NULL,
    description  VARCHAR(255),
    is_active    BOOLEAN        NOT NULL DEFAULT TRUE
);

-- -----------------------------------------------------------------
--  PRESCRIPTIONS
-- -----------------------------------------------------------------
CREATE TABLE prescriptions (
    prescription_id   SERIAL PRIMARY KEY,
    consult_id        INT       NOT NULL REFERENCES consultations(consult_id),
    prescription_date TIMESTAMP NOT NULL DEFAULT NOW(),
    chief_complaint   TEXT,
    diagnosis         TEXT,
    follow_up_date    DATE
);

-- -----------------------------------------------------------------
--  LAB TEST CATALOG
-- -----------------------------------------------------------------
CREATE TABLE lab_test_catalog (
    catalog_id   SERIAL PRIMARY KEY,
    test_name    VARCHAR(150)  NOT NULL UNIQUE,
    description  VARCHAR(255),
    normal_range VARCHAR(100),
    unit         VARCHAR(50),
    service_id   INT           REFERENCES services(service_id)
);

-- -----------------------------------------------------------------
--  PRESCRIPTION LAB TEST ORDERS
-- -----------------------------------------------------------------
CREATE TABLE prescription_lab_tests (
    lab_test_id     SERIAL PRIMARY KEY,
    prescription_id INT          NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    catalog_id      INT          REFERENCES lab_test_catalog(catalog_id),
    lab_test_name   VARCHAR(100)              -- free-text fallback if not in catalog
);

-- -----------------------------------------------------------------
--  LAB RESULTS
-- -----------------------------------------------------------------
CREATE TABLE lab_results (
    result_id     SERIAL PRIMARY KEY,
    lab_test_id   INT         NOT NULL REFERENCES prescription_lab_tests(lab_test_id),
    performed_by  INT         REFERENCES medical_staffs(medical_staff_id),
    result_value  VARCHAR(255),
    result_notes  TEXT,
    result_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (result_status IN ('pending','in_progress','completed','cancelled')),
    resulted_at   TIMESTAMP,
    upload_id     INT         REFERENCES file_uploads(upload_id) ON DELETE SET NULL,
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------
--  TRANSACTIONS
-- -----------------------------------------------------------------
CREATE TABLE transactions (
    transaction_id   SERIAL PRIMARY KEY,
    account_id       INT           NOT NULL REFERENCES accounts(account_id),
    trans_type       VARCHAR(32),
    amount           NUMERIC(10,2) NOT NULL,
    transaction_date TIMESTAMP     NOT NULL DEFAULT NOW(),
    reference_note   VARCHAR(255)
);

-- -----------------------------------------------------------------
--  INVOICES
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
--  INVOICE LINE ITEMS
-- -----------------------------------------------------------------
CREATE TABLE invoice_line_items (
    line_item_id  SERIAL PRIMARY KEY,
    invoice_id    INT           NOT NULL REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    service_id    INT           REFERENCES services(service_id),
    description   VARCHAR(255)  NOT NULL,
    quantity      INT           NOT NULL DEFAULT 1,
    unit_price    NUMERIC(10,2) NOT NULL,
    total_price   NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- -----------------------------------------------------------------
--  NOTIFICATIONS
-- -----------------------------------------------------------------
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

-- -----------------------------------------------------------------
--  AUDIT LOG
-- -----------------------------------------------------------------
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
