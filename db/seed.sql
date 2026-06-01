-- =================================================================
--  Uni Medicare — Seed Data
--  PostgreSQL 16+
-- =================================================================

-- Password hashes:
-- Admin1234!    $2a$10$OSAFP4W.YhY/qna3967IiOkKmT3yXCiy3qdljriSuMYHDyMnj68b6
-- Doctor1234!   $2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS
-- Patient1234!  $2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi

-- -----------------------------------------------------------------
--  ACCOUNTS (medical center + 15 student accounts)
-- -----------------------------------------------------------------
INSERT INTO accounts (balance) VALUES (100000.00);  -- account_id=1 (medical center)
INSERT INTO accounts (balance) SELECT 5000.00 FROM generate_series(1, 15);  -- account_id=2..16

-- -----------------------------------------------------------------
--  DEPARTMENTS (6 — university medical center)
-- -----------------------------------------------------------------
INSERT INTO departments (name, description) VALUES
    ('General Medicine',                'Primary care, checkups, and common illnesses'),
    ('Counseling',                      'Mental health, therapy, and stress management'),
    ('Laboratory',                      'Diagnostic testing, blood work, and pathology'),
    ('Emergency',                       'Urgent and emergency care services'),
    ('Physiotherapy',                   'Physical rehabilitation and therapy'),
    ('Reproductive & Sexual Health',    'Gynecology, urology, and reproductive health');

-- -----------------------------------------------------------------
--  MEDICAL STAFF ROLES
-- -----------------------------------------------------------------
INSERT INTO medical_staff_roles (role_id, role_name, can_prescribe) VALUES
    (1, 'DOCTOR',          TRUE),
    (2, 'NURSE',           FALSE),
    (3, 'LAB_TECHNICIAN',  FALSE),
    (4, 'RECEPTIONIST',    FALSE),
    (5, 'ADMIN',           FALSE);

-- -----------------------------------------------------------------
--  MEDICAL STAFFS
--  13 doctors + 6 nurses + 1 lab tech + 1 receptionist + 1 admin
-- -----------------------------------------------------------------
INSERT INTO medical_staffs (medical_staff_id, role_id, department_id, name, specialty, email, phone, password) VALUES
    -- Doctors — General Medicine (dept 1)
    (1001, 1, 1, 'Dr. Emily Carter',       'General Medicine',  'emily.carter@unimedicare.edu',    '07700100001', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1002, 1, 1, 'Dr. James Mitchell',     'General Medicine',  'james.mitchell@unimedicare.edu',  '07700100002', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Doctors — Counseling (dept 2)
    (1003, 1, 2, 'Dr. Sophie Laurent',     'Counseling',        'sophie.laurent@unimedicare.edu',  '07700100003', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1004, 1, 2, 'Dr. Marcus Weber',       'Counseling',        'marcus.weber@unimedicare.edu',    '07700100004', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Doctor — Laboratory (dept 3) — Pathologist
    (1005, 1, 3, 'Dr. Elena Rossi',        'Pathology',         'elena.rossi@unimedicare.edu',     '07700100005', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Doctors — Emergency (dept 4) — 3 doctors for 24/7 coverage
    (1006, 1, 4, 'Dr. Daniel Fischer',     'Emergency Medicine','daniel.fischer@unimedicare.edu',  '07700100006', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1007, 1, 4, 'Dr. Olivia Barnes',      'Emergency Medicine','olivia.barnes@unimedicare.edu',   '07700100007', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1022, 1, 4, 'Dr. Nadia Petrova',      'Emergency Medicine','nadia.petrova@unimedicare.edu',   '07700100022', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Doctors — Physiotherapy (dept 5)
    (1008, 1, 5, 'Dr. Lucas Martin',       'Physiotherapy',     'lucas.martin@unimedicare.edu',    '07700100008', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1009, 1, 5, 'Dr. Anna Kowalski',      'Physiotherapy',     'anna.kowalski@unimedicare.edu',   '07700100009', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Doctors — Reproductive & Sexual Health (dept 6)
    (1010, 1, 6, 'Dr. Isabelle Dupont',    'Gynecology',        'isabelle.dupont@unimedicare.edu', '07700100010', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1011, 1, 6, 'Dr. Catherine O''Brien', 'Gynecology',        'catherine.obrien@unimedicare.edu','07700100011', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1012, 1, 6, 'Dr. Thomas Eriksson',    'Urology',           'thomas.eriksson@unimedicare.edu', '07700100012', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Nurses (6)
    (1013, 2, 1, 'Nurse Claire Dubois',    NULL,                'claire.dubois@unimedicare.edu',   '07700100013', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1014, 2, 2, 'Nurse Henrik Larsson',   NULL,                'henrik.larsson@unimedicare.edu',  '07700100014', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1015, 2, 4, 'Nurse Maria Silva',      NULL,                'maria.silva@unimedicare.edu',     '07700100015', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1016, 2, 5, 'Nurse Patrick O''Connor',NULL,                'patrick.oconnor@unimedicare.edu', '07700100016', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1017, 2, 6, 'Nurse Yuki Tanaka',      NULL,                'yuki.tanaka@unimedicare.edu',     '07700100017', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1018, 2, 3, 'Nurse Liam Foster',      NULL,                'liam.foster@unimedicare.edu',     '07700100018', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Lab Technician (1)
    (1019, 3, 3, 'Lab Tech Nora Bergmann',  NULL,                'nora.bergmann@unimedicare.edu',   '07700100019', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Receptionist (1)
    (1020, 4, NULL, 'Receptionist Fiona McAlister', NULL,        'fiona.mcalister@unimedicare.edu', '07700100020', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Admin (1)
    (1021, 5, NULL, 'Admin Robert van Dijk', NULL,               'admin@unimedicare.com',           '07700100021', '$2a$10$OSAFP4W.YhY/qna3967IiOkKmT3yXCiy3qdljriSuMYHDyMnj68b6');

-- -----------------------------------------------------------------
--  STAFF SCHEDULES (all 12 doctors, Sun-Thu or Mon-Fri)
-- -----------------------------------------------------------------
INSERT INTO staff_schedules (medical_staff_id, day_of_week, start_time, end_time) VALUES
    -- Dr. Emily Carter (General Medicine): Sun-Thu 09:00-14:00
    (1001, 0, '09:00', '14:00'), (1001, 1, '09:00', '14:00'), (1001, 2, '09:00', '14:00'),
    (1001, 3, '09:00', '14:00'), (1001, 4, '09:00', '14:00'),
    -- Dr. James Mitchell (General Medicine): Sun-Thu 14:00-19:00
    (1002, 0, '14:00', '19:00'), (1002, 1, '14:00', '19:00'), (1002, 2, '14:00', '19:00'),
    (1002, 3, '14:00', '19:00'), (1002, 4, '14:00', '19:00'),
    -- Dr. Sophie Laurent (Counseling): Mon-Fri 10:00-16:00
    (1003, 1, '10:00', '16:00'), (1003, 2, '10:00', '16:00'), (1003, 3, '10:00', '16:00'),
    (1003, 4, '10:00', '16:00'), (1003, 5, '10:00', '16:00'),
    -- Dr. Marcus Weber (Counseling): Mon-Fri 09:00-15:00
    (1004, 1, '09:00', '15:00'), (1004, 2, '09:00', '15:00'), (1004, 3, '09:00', '15:00'),
    (1004, 4, '09:00', '15:00'), (1004, 5, '09:00', '15:00'),
    -- Dr. Elena Rossi (Pathology): Sun-Thu 08:00-14:00
    (1005, 0, '08:00', '14:00'), (1005, 1, '08:00', '14:00'), (1005, 2, '08:00', '14:00'),
    (1005, 3, '08:00', '14:00'), (1005, 4, '08:00', '14:00'),
    -- Dr. Daniel Fischer (Emergency): Sun-Thu 08:00-16:00
    (1006, 0, '08:00', '16:00'), (1006, 1, '08:00', '16:00'), (1006, 2, '08:00', '16:00'),
    (1006, 3, '08:00', '16:00'), (1006, 4, '08:00', '16:00'),
    -- Dr. Olivia Barnes (Emergency): Sun-Thu 16:00-22:00
    (1007, 0, '16:00', '22:00'), (1007, 1, '16:00', '22:00'), (1007, 2, '16:00', '22:00'),
    (1007, 3, '16:00', '22:00'), (1007, 4, '16:00', '22:00'),
    -- Dr. Lucas Martin (Physiotherapy): Mon-Fri 09:00-14:00
    (1008, 1, '09:00', '14:00'), (1008, 2, '09:00', '14:00'), (1008, 3, '09:00', '14:00'),
    (1008, 4, '09:00', '14:00'), (1008, 5, '09:00', '14:00'),
    -- Dr. Anna Kowalski (Physiotherapy): Mon-Fri 14:00-19:00
    (1009, 1, '14:00', '19:00'), (1009, 2, '14:00', '19:00'), (1009, 3, '14:00', '19:00'),
    (1009, 4, '14:00', '19:00'), (1009, 5, '14:00', '19:00'),
    -- Dr. Isabelle Dupont (Gynecology): Sun-Thu 09:00-14:00
    (1010, 0, '09:00', '14:00'), (1010, 1, '09:00', '14:00'), (1010, 2, '09:00', '14:00'),
    (1010, 3, '09:00', '14:00'), (1010, 4, '09:00', '14:00'),
    -- Dr. Catherine O'Brien (Gynecology): Sun-Thu 14:00-19:00
    (1011, 0, '14:00', '19:00'), (1011, 1, '14:00', '19:00'), (1011, 2, '14:00', '19:00'),
    (1011, 3, '14:00', '19:00'), (1011, 4, '14:00', '19:00'),
    -- Dr. Thomas Eriksson (Urology): Mon-Fri 10:00-15:00
    (1012, 1, '10:00', '15:00'), (1012, 2, '10:00', '15:00'), (1012, 3, '10:00', '15:00'),
    (1012, 4, '10:00', '15:00'), (1012, 5, '10:00', '15:00'),
    -- Dr. Nadia Petrova (Emergency): Sun-Thu 00:00-08:00 (night shift)
    (1022, 0, '00:00', '08:00'), (1022, 1, '00:00', '08:00'), (1022, 2, '00:00', '08:00'),
    (1022, 3, '00:00', '08:00'), (1022, 4, '00:00', '08:00');

-- -----------------------------------------------------------------
--  DEPARTMENT SCHEDULES
-- -----------------------------------------------------------------
INSERT INTO department_schedules (department_id, slot_duration_minutes, start_time, end_time, break_start, break_end, is_bookable) VALUES
    (1, 20, '08:00', '17:10', '13:00', '13:30', TRUE),   -- General Medicine
    (2, 50, '09:00', '17:00', '13:00', '13:30', TRUE),   -- Counseling
    (3, 20, '08:00', '16:00', '12:00', '12:30', FALSE),  -- Laboratory (walk-in/referral only)
    (4, 20, '00:00', '23:59', '13:00', '13:30', FALSE),  -- Emergency (24/7, walk-in only)
    (5, 30, '08:00', '17:00', '13:00', '13:30', TRUE),   -- Physiotherapy
    (6, 30, '09:00', '17:00', '13:00', '13:30', TRUE);   -- Reproductive & Sexual Health

-- -----------------------------------------------------------------
--  STUDENTS (15 students, account_id = 2..16)
-- -----------------------------------------------------------------
INSERT INTO students (student_id, name, email, phone, password, issued_on, account_id) VALUES
    (2021001, 'Emma Johansson',    'emma.j@student.edu',      '07700200001', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 2),
    (2021002, 'Liam O''Sullivan',  'liam.os@student.edu',     '07700200002', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 3),
    (2021003, 'Sofia Rossi',       'sofia.r@student.edu',     '07700200003', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 4),
    (2021004, 'Noah Fischer',      'noah.f@student.edu',      '07700200004', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 5),
    (2021005, 'Mia Dubois',        'mia.d@student.edu',       '07700200005', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 6),
    (2021006, 'Ethan Larsson',     'ethan.l@student.edu',     '07700200006', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-01-10', 7),
    (2021007, 'Ava McAllister',    'ava.m@student.edu',       '07700200007', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-06-01', 8),
    (2021008, 'Oscar Nilsson',     'oscar.n@student.edu',     '07700200008', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 9),
    (2021009, 'Charlotte Berger',  'charlotte.b@student.edu', '07700200009', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 10),
    (2021010, 'William de Vries',  'william.d@student.edu',   '07700200010', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 11),
    (2021011, 'Ella Petersen',     'ella.p@student.edu',      '07700200011', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 12),
    (2021012, 'Hugo Moreau',       'hugo.m@student.edu',      '07700200012', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 13),
    (2021013, 'Zoe Ivanova',       'zoe.i@student.edu',       '07700200013', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 14),
    (2021014, 'Sebastian Kraft',   'sebastian.k@student.edu', '07700200014', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-01-10', 15),
    (2021015, 'Luna Fernandez',    'luna.f@student.edu',      '07700200015', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 16);

-- Mark all seeded students as email-verified
UPDATE students SET email_verified = TRUE WHERE email_verified = FALSE;

-- -----------------------------------------------------------------
--  PATIENTS (one per student)
-- -----------------------------------------------------------------
INSERT INTO patients (student_id, date_of_birth, bloodgroup, sex, allergies, emergency_contact_name, emergency_contact_phone) VALUES
    (2021001, '2001-03-15', 'A+',  'F', NULL,                    'Erik Johansson',   '07700300001'),
    (2021002, '2000-07-22', 'B+',  'M', 'Penicillin',            'Siobhan O''Sullivan','07700300002'),
    (2021003, '2001-11-08', 'O+',  'F', NULL,                    'Marco Rossi',      '07700300003'),
    (2021004, '2000-01-30', 'AB+', 'M', 'Dust, Pollen',          'Hans Fischer',     '07700300004'),
    (2021005, '2001-05-12', 'A-',  'F', NULL,                    'Pierre Dubois',    '07700300005'),
    (2021006, '1999-09-25', 'B-',  'M', 'Aspirin',               'Anders Larsson',   '07700300006'),
    (2021007, '2000-12-03', 'O-',  'F', NULL,                    'Sean McAllister',  '07700300007'),
    (2021008, '2002-04-18', 'A+',  'M', NULL,                    'Gustaf Nilsson',   '07700300008'),
    (2021009, '2001-08-09', 'B+',  'F', 'Shellfish',             'Klaus Berger',     '07700300009'),
    (2021010, '2002-02-14', 'O+',  'M', NULL,                    'Pieter de Vries',  '07700300010'),
    (2021011, '2001-06-20', 'AB-', 'F', NULL,                    'Lars Petersen',    '07700300011'),
    (2021012, '2000-10-11', 'A+',  'M', 'Latex',                 'Jacques Moreau',   '07700300012'),
    (2021013, '2001-01-05', 'B+',  'F', NULL,                    'Dmitri Ivanova',   '07700300013'),
    (2021014, '1999-04-28', 'O+',  'M', NULL,                    'Wolfgang Kraft',   '07700300014'),
    (2021015, '2002-07-16', 'A-',  'F', 'Sulfa drugs',           'Carlos Fernandez', '07700300015');

-- -----------------------------------------------------------------
--  HISTORIES
-- -----------------------------------------------------------------
INSERT INTO histories (patient_id, condition_details, condition_status, year_diagnosed) VALUES
    (2,  'Mild asthma',             'Controlled',      2015),
    (4,  'Allergic rhinitis',       'Active',          2018),
    (6,  'Childhood eczema',        'Resolved',        2010),
    (9,  'Iron deficiency anemia',  'Under treatment', 2023),
    (12, 'Migraine disorder',       'Active',          2019);

-- -----------------------------------------------------------------
--  SERVICES (fee catalog)
-- -----------------------------------------------------------------
INSERT INTO services (service_name, category, unit_price, description) VALUES
    ('General Consultation',     'consultation', 200.00,  'Standard doctor consultation'),
    ('Specialist Consultation',  'consultation', 500.00,  'Specialist consultation'),
    ('Counseling Session',       'consultation', 400.00,  'Mental health counseling session'),
    ('Complete Blood Count',     'lab',          300.00,  'CBC with differential'),
    ('Blood Glucose Test',       'lab',          150.00,  'Fasting blood sugar test'),
    ('Urine Analysis',           'lab',          200.00,  'Complete urinalysis'),
    ('Lipid Profile',            'lab',          450.00,  'Cholesterol and triglycerides panel'),
    ('X-Ray (Chest)',            'procedure',    600.00,  'Chest X-ray PA view'),
    ('Physiotherapy Session',    'procedure',    350.00,  'Physical therapy session'),
    ('Emergency Assessment',     'other',        300.00,  'Emergency triage and initial assessment');

-- -----------------------------------------------------------------
--  LAB TEST CATALOG
-- -----------------------------------------------------------------
INSERT INTO lab_test_catalog (test_name, description, normal_range, unit, service_id) VALUES
    ('Complete Blood Count',    'Full blood count with differential',  '4.5-11.0',     '10^3/µL', 4),
    ('Fasting Blood Sugar',     'Glucose after 8hr fast',              '70-100',       'mg/dL',   5),
    ('Urinalysis',              'Physical/chemical/microscopic exam',  'N/A',          NULL,      6),
    ('Total Cholesterol',       'Total blood cholesterol',             '< 200',        'mg/dL',   7),
    ('HDL Cholesterol',         'High-density lipoprotein',            '40-60',        'mg/dL',   7),
    ('LDL Cholesterol',         'Low-density lipoprotein',             '< 100',        'mg/dL',   7),
    ('Triglycerides',           'Blood triglyceride level',            '< 150',        'mg/dL',   7),
    ('Hemoglobin',              'Blood hemoglobin concentration',      '12.0-17.5',    'g/dL',    4),
    ('ESR',                     'Erythrocyte sedimentation rate',      '0-20',         'mm/hr',   4),
    ('Serum Creatinine',        'Kidney function marker',              '0.7-1.3',      'mg/dL',   NULL);

-- -----------------------------------------------------------------
--  SAMPLE APPOINTMENTS
-- -----------------------------------------------------------------
INSERT INTO appointments (patient_id, medical_staff_id, scheduled_time, reason, status, deposit_amount, deposit_account_id) VALUES
    (1, 1001, NOW() - INTERVAL '10 days', 'Persistent headache',        'completed', 50.00, 2),
    (2, 1001, NOW() - INTERVAL '7 days',  'Follow-up asthma checkup',   'completed', 50.00, 3),
    (3, 1006, NOW() - INTERVAL '5 days',  'Chest pain evaluation',      'completed', 50.00, 4),
    (4, 1001, NOW() - INTERVAL '3 days',  'Seasonal allergy symptoms',  'completed', 50.00, 5),
    (5, 1010, NOW() + INTERVAL '1 day',   'Annual checkup',             'booked',    50.00, 6),
    (6, 1001, NOW() + INTERVAL '2 days',  'Skin rash consultation',     'booked',    50.00, 7),
    (7, 1003, NOW() + INTERVAL '3 days',  'Stress management',          'booked',    50.00, 8),
    (1, 1001, NOW() + INTERVAL '5 days',  'Follow-up headache',         'booked',    50.00, 2);

-- -----------------------------------------------------------------
--  SAMPLE CONSULTATIONS
-- -----------------------------------------------------------------
INSERT INTO consultations (patient_id, medical_staff_id, appointment_id, consult_time, notes) VALUES
    (1, 1001, 1, NOW() - INTERVAL '10 days', 'Patient presents with recurring headaches. No neurological signs. Advised lifestyle changes.'),
    (2, 1001, 2, NOW() - INTERVAL '7 days',  'Asthma well controlled on current inhaler. Continue current medication.'),
    (3, 1006, 3, NOW() - INTERVAL '5 days',  'Chest pain non-cardiac in origin. Likely musculoskeletal. ECG normal.'),
    (4, 1001, 4, NOW() - INTERVAL '3 days',  'Allergic rhinitis flare-up. Prescribed antihistamines.');

-- -----------------------------------------------------------------
--  SAMPLE VITAL SIGNS
-- -----------------------------------------------------------------
INSERT INTO vital_signs (consult_id, bp, pulse, temp, respiratory_rate, oxygen_saturation, blood_glucose, weight, height) VALUES
    (1, '120/80',  72, 98.6, 16, 98.00, 95.00,  65.50, 165.00),
    (2, '118/76',  68, 98.2, 14, 99.00, 88.00,  70.20, 172.00),
    (3, '130/85',  80, 98.4, 18, 97.50, 92.00,  80.00, 175.00),
    (4, '122/78',  74, 99.0, 16, 98.50, 90.00,  55.00, 160.00);

-- -----------------------------------------------------------------
--  SAMPLE PRESCRIPTIONS
-- -----------------------------------------------------------------
INSERT INTO prescriptions (consult_id, chief_complaint, diagnosis, follow_up_date) VALUES
    (1, 'Recurring headaches for 2 weeks',     'Tension-type headache',         (NOW() + INTERVAL '14 days')::DATE),
    (2, 'Routine asthma follow-up',            'Bronchial asthma — controlled', NULL),
    (4, 'Sneezing, runny nose, itchy eyes',    'Allergic rhinitis',             (NOW() + INTERVAL '7 days')::DATE);

-- -----------------------------------------------------------------
--  SAMPLE PRESCRIPTION LAB TESTS
-- -----------------------------------------------------------------
INSERT INTO prescription_lab_tests (prescription_id, catalog_id, lab_test_name) VALUES
    (1, 1, 'Complete Blood Count'),
    (1, 2, 'Fasting Blood Sugar'),
    (2, 8, 'Hemoglobin');

-- -----------------------------------------------------------------
--  SAMPLE LAB RESULTS
-- -----------------------------------------------------------------
INSERT INTO lab_results (lab_test_id, performed_by, result_value, result_notes, result_status, resulted_at) VALUES
    (1, 1019, '8.2 x10^3/µL',  'Within normal range',          'completed', NOW() - INTERVAL '9 days'),
    (2, 1019, '92 mg/dL',       'Normal fasting glucose',       'completed', NOW() - INTERVAL '9 days'),
    (3, NULL,  NULL,             NULL,                           'pending',   NULL);

-- -----------------------------------------------------------------
--  SAMPLE NOTIFICATIONS
-- -----------------------------------------------------------------
INSERT INTO notifications (recipient_type, recipient_id, title, message) VALUES
    ('student', 2021001, 'Lab Results Ready',         'Your Complete Blood Count results are now available.'),
    ('student', 2021001, 'Upcoming Appointment',      'Reminder: You have a follow-up appointment in 5 days.'),
    ('student', 2021005, 'Appointment Confirmed',     'Your annual checkup has been confirmed.'),
    ('staff',   1001,    'New Patient Assignment',     'You have 3 new appointments scheduled this week.'),
    ('staff',   1019,    'Pending Lab Tests',          'There are 1 pending lab tests awaiting processing.');
