-- =================================================================
--  Uni Medicare — Seed Data
--  PostgreSQL 16+
-- =================================================================

-- bcrypt hash of "Password123!"
-- $2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG
-- bcrypt hash of "Admin1234!"
-- $2a$10$OSAFP4W.YhY/qna3967IiOkKmT3yXCiy3qdljriSuMYHDyMnj68b6
-- bcrypt hash of "Doctor1234!"
-- $2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi
-- bcrypt hash of "Patient1234!"
-- $2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi

-- -----------------------------------------------------------------
--  ACCOUNTS (medical center + 20 student accounts)
-- -----------------------------------------------------------------
INSERT INTO accounts (balance) VALUES (100000.00);  -- account_id=1 (medical center)
INSERT INTO accounts (balance) SELECT 5000.00 FROM generate_series(1, 20);  -- account_id=2..21

-- -----------------------------------------------------------------
--  DEPARTMENTS
-- -----------------------------------------------------------------
INSERT INTO departments (name, description) VALUES
    ('General Medicine',  'Primary care and general health services'),
    ('Cardiology',        'Heart and cardiovascular system'),
    ('Ophthalmology',     'Eye care and vision'),
    ('ENT',               'Ear, nose, and throat'),
    ('Gynecology',        'Women reproductive health'),
    ('Pediatrics',        'Child and adolescent medicine'),
    ('Dermatology',       'Skin, hair, and nail conditions'),
    ('Orthopedics',       'Bones, joints, and musculoskeletal'),
    ('Neurology',         'Brain and nervous system'),
    ('Laboratory',        'Diagnostic testing and lab services'),
    ('Emergency',         'Emergency and urgent care'),
    ('Administration',    'Administrative operations');

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
--  MEDICAL STAFFS (10 doctors + 2 nurses + 2 lab techs + 2 receptionists + 2 admins)
-- -----------------------------------------------------------------
-- Doctor password hash: $2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi (Doctor1234!)
-- Other staff password hash: $2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG (Password123!)
INSERT INTO medical_staffs (medical_staff_id, role_id, department_id, name, specialty, email, phone, password) VALUES
    -- Doctors (10)
    (1001, 1, 1,  'Dr. Sarah Ahmed',       'General Medicine', 'doctor@unimedicare.com',        '01712345001', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1002, 1, 2,  'Dr. Kamal Hossain',     'Cardiology',       'kamal.hossain@unimedicare.edu', '01712345002', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1003, 1, 3,  'Dr. Nadia Rahman',      'Ophthalmology',    'nadia.rahman@unimedicare.edu',  '01712345003', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1004, 1, 4,  'Dr. Aminul Islam',      'ENT',              'aminul.islam@unimedicare.edu',  '01712345004', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1005, 1, 5,  'Dr. Fatema Begum',      'Gynecology',       'fatema.begum@unimedicare.edu',  '01712345005', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1006, 1, 6,  'Dr. Rashid Khan',       'Pediatrics',       'rashid.khan@unimedicare.edu',   '01712345006', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1007, 1, 7,  'Dr. Sabrina Akter',     'Dermatology',      'sabrina.akter@unimedicare.edu', '01712345007', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1008, 1, 8,  'Dr. Tanvir Hasan',      'Orthopedics',      'tanvir.hasan@unimedicare.edu',  '01712345008', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1009, 1, 9,  'Dr. Nusrat Jahan',      'Neurology',        'nusrat.jahan@unimedicare.edu',  '01712345009', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    (1010, 1, 1,  'Dr. Imran Hossain',     'General Medicine', 'imran.hossain@unimedicare.edu', '01712345010', '$2a$10$QqTmSDNgTcpt4lKh25pFLeHuRdWRyFF/7dugoCVnOReQh4bddWiyS'),
    -- Nurses
    (1011, 2, 1,  'Nurse Ayesha Siddiqui', NULL,               'ayesha.s@unimedicare.edu',      '01712345011', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    (1012, 2, 11, 'Nurse Rahim Uddin',     NULL,               'rahim.u@unimedicare.edu',       '01712345012', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    -- Lab Technicians
    (1013, 3, 10, 'Lab Tech Nadia Islam',  NULL,               'nadia.i@unimedicare.edu',       '01712345013', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    (1014, 3, 10, 'Lab Tech Arif Khan',    NULL,               'arif.k@unimedicare.edu',        '01712345014', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    -- Receptionists
    (1015, 4, 12, 'Receptionist Mina Das', NULL,               'mina.d@unimedicare.edu',        '01712345015', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    (1016, 4, 12, 'Receptionist Tanvir A', NULL,               'tanvir.a@unimedicare.edu',      '01712345016', '$2a$10$jp2DikONx1AxR2iabR0Dx.EVIAlxotTeKyf/BM5Xd2n9F9InkmqdG'),
    -- Admins
    (1017, 5, 12, 'Admin Rashid Hasan',    NULL,               'admin@unimedicare.com',         '01712345017', '$2a$10$OSAFP4W.YhY/qna3967IiOkKmT3yXCiy3qdljriSuMYHDyMnj68b6'),
    (1018, 5, 12, 'Admin Sumaiya Begum',   NULL,               'sumaiya.b@unimedicare.edu',     '01712345018', '$2a$10$OSAFP4W.YhY/qna3967IiOkKmT3yXCiy3qdljriSuMYHDyMnj68b6');

-- -----------------------------------------------------------------
--  STAFF SCHEDULES (all 10 doctors, Sun-Thu or Mon-Fri patterns)
-- -----------------------------------------------------------------
INSERT INTO staff_schedules (medical_staff_id, day_of_week, start_time, end_time) VALUES
    -- Dr. Sarah Ahmed (General Medicine): Sun-Thu 09:00-14:00
    (1001, 0, '09:00', '14:00'), (1001, 1, '09:00', '14:00'), (1001, 2, '09:00', '14:00'),
    (1001, 3, '09:00', '14:00'), (1001, 4, '09:00', '14:00'),
    -- Dr. Kamal Hossain (Cardiology): Sun-Thu 10:00-16:00
    (1002, 0, '10:00', '16:00'), (1002, 1, '10:00', '16:00'), (1002, 2, '10:00', '16:00'),
    (1002, 3, '10:00', '16:00'), (1002, 4, '10:00', '16:00'),
    -- Dr. Nadia Rahman (Ophthalmology): Mon-Fri 09:00-13:00
    (1003, 1, '09:00', '13:00'), (1003, 2, '09:00', '13:00'), (1003, 3, '09:00', '13:00'),
    (1003, 4, '09:00', '13:00'), (1003, 5, '09:00', '13:00'),
    -- Dr. Aminul Islam (ENT): Sun-Thu 10:00-15:00
    (1004, 0, '10:00', '15:00'), (1004, 1, '10:00', '15:00'), (1004, 2, '10:00', '15:00'),
    (1004, 3, '10:00', '15:00'), (1004, 4, '10:00', '15:00'),
    -- Dr. Fatema Begum (Gynecology): Mon-Sat 09:00-14:00
    (1005, 1, '09:00', '14:00'), (1005, 2, '09:00', '14:00'), (1005, 3, '09:00', '14:00'),
    (1005, 4, '09:00', '14:00'), (1005, 5, '09:00', '14:00'), (1005, 6, '09:00', '14:00'),
    -- Dr. Rashid Khan (Pediatrics): Sun-Thu 08:00-13:00
    (1006, 0, '08:00', '13:00'), (1006, 1, '08:00', '13:00'), (1006, 2, '08:00', '13:00'),
    (1006, 3, '08:00', '13:00'), (1006, 4, '08:00', '13:00'),
    -- Dr. Sabrina Akter (Dermatology): Mon-Fri 10:00-15:00
    (1007, 1, '10:00', '15:00'), (1007, 2, '10:00', '15:00'), (1007, 3, '10:00', '15:00'),
    (1007, 4, '10:00', '15:00'), (1007, 5, '10:00', '15:00'),
    -- Dr. Tanvir Hasan (Orthopedics): Sun-Thu 09:00-15:00
    (1008, 0, '09:00', '15:00'), (1008, 1, '09:00', '15:00'), (1008, 2, '09:00', '15:00'),
    (1008, 3, '09:00', '15:00'), (1008, 4, '09:00', '15:00'),
    -- Dr. Nusrat Jahan (Neurology): Mon-Fri 11:00-16:00
    (1009, 1, '11:00', '16:00'), (1009, 2, '11:00', '16:00'), (1009, 3, '11:00', '16:00'),
    (1009, 4, '11:00', '16:00'), (1009, 5, '11:00', '16:00'),
    -- Dr. Imran Hossain (General Medicine): Sun-Thu 14:00-19:00
    (1010, 0, '14:00', '19:00'), (1010, 1, '14:00', '19:00'), (1010, 2, '14:00', '19:00'),
    (1010, 3, '14:00', '19:00'), (1010, 4, '14:00', '19:00'),
    -- Nurse Ayesha: Sun-Thu 08:00-15:00
    (1011, 0, '08:00', '15:00'), (1011, 1, '08:00', '15:00'), (1011, 2, '08:00', '15:00'),
    (1011, 3, '08:00', '15:00'), (1011, 4, '08:00', '15:00'),
    -- Nurse Rahim: Mon-Fri 08:00-15:00
    (1012, 1, '08:00', '15:00'), (1012, 2, '08:00', '15:00'), (1012, 3, '08:00', '15:00'),
    (1012, 4, '08:00', '15:00'), (1012, 5, '08:00', '15:00');

-- -----------------------------------------------------------------
--  STUDENTS (20 students, account_id = 2..21)
-- -----------------------------------------------------------------
-- Patient password hash: $2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi (Patient1234!)
INSERT INTO students (student_id, name, email, phone, password, issued_on, account_id) VALUES
    (2021001, 'Anika Tabassum',   'patient@unimedicare.com',  '01811001001', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 2),
    (2021002, 'Rafiq Mahmud',     'rafiq.m@student.edu',      '01811001002', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 3),
    (2021003, 'Sadia Akter',      'sadia.a@student.edu',      '01811001003', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 4),
    (2021004, 'Hassan Chowdhury', 'hassan.c@student.edu',     '01811001004', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 5),
    (2021005, 'Tasnim Ferdous',   'tasnim.f@student.edu',     '01811001005', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 6),
    (2021006, 'Imran Hossain',    'imran.h@student.edu',      '01811001006', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-01-10', 7),
    (2021007, 'Nusrat Jahan',     'nusrat.j@student.edu',     '01811001007', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-06-01', 8),
    (2021008, 'Shakib Rahman',    'shakib.r@student.edu',     '01811001008', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 9),
    (2021009, 'Mehzabin Alam',    'mehzabin.a@student.edu',   '01811001009', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 10),
    (2021010, 'Farhan Rashid',    'farhan.r@student.edu',     '01811001010', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 11),
    (2021011, 'Labiba Khan',      'labiba.k@student.edu',     '01811001011', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 12),
    (2021012, 'Tamim Iqbal',      'tamim.i@student.edu',      '01811001012', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 13),
    (2021013, 'Rubina Sultana',   'rubina.s@student.edu',     '01811001013', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-06-01', 14),
    (2021014, 'Sabbir Ahmed',     'sabbir.a@student.edu',     '01811001014', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-01-10', 15),
    (2021015, 'Farzana Yasmin',   'farzana.y@student.edu',    '01811001015', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 16),
    (2021016, 'Mahfuz Haque',     'mahfuz.h@student.edu',     '01811001016', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 17),
    (2021017, 'Sharmin Nahar',    'sharmin.n@student.edu',    '01811001017', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2023-01-15', 18),
    (2021018, 'Zahid Islam',      'zahid.i@student.edu',      '01811001018', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2022-06-01', 19),
    (2021019, 'Parveen Akter',    'parveen.a@student.edu',    '01811001019', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-01-15', 20),
    (2021020, 'Nazmul Karim',     'nazmul.k@student.edu',     '01811001020', '$2a$10$5Kr6Gv3zKcFfOmKy.OO2t.HyUck.eJOE1n.N1qm8VB1KXFqH/khbi', '2024-06-01', 21);

-- Mark all seeded students as email-verified so they can log in
UPDATE students SET email_verified = TRUE WHERE email_verified = FALSE;

-- -----------------------------------------------------------------
--  PATIENTS (one per student)
-- -----------------------------------------------------------------
INSERT INTO patients (student_id, date_of_birth, bloodgroup, sex, allergies, emergency_contact_name, emergency_contact_phone) VALUES
    (2021001, '2001-03-15', 'A+',  'F', NULL,                    'Kamal Tabassum',  '01911001001'),
    (2021002, '2000-07-22', 'B+',  'M', 'Penicillin',            'Selim Mahmud',    '01911001002'),
    (2021003, '2001-11-08', 'O+',  'F', NULL,                    'Rina Akter',      '01911001003'),
    (2021004, '2000-01-30', 'AB+', 'M', 'Dust, Pollen',          'Jamal Chowdhury', '01911001004'),
    (2021005, '2001-05-12', 'A-',  'F', NULL,                    'Nasim Ferdous',   '01911001005'),
    (2021006, '1999-09-25', 'B-',  'M', 'Aspirin',               'Karim Hossain',   '01911001006'),
    (2021007, '2000-12-03', 'O-',  'F', NULL,                    'Rahim Jahan',     '01911001007'),
    (2021008, '2002-04-18', 'A+',  'M', NULL,                    'Shahed Rahman',   '01911001008'),
    (2021009, '2001-08-09', 'B+',  'F', 'Shellfish',             'Mamun Alam',      '01911001009'),
    (2021010, '2002-02-14', 'O+',  'M', NULL,                    'Rashid Sr.',      '01911001010'),
    (2021011, '2001-06-20', 'AB-', 'F', NULL,                    'Belal Khan',      '01911001011'),
    (2021012, '2000-10-11', 'A+',  'M', 'Latex',                 'Sohel Iqbal',     '01911001012'),
    (2021013, '2001-01-05', 'B+',  'F', NULL,                    'Babul Sultana',   '01911001013'),
    (2021014, '1999-04-28', 'O+',  'M', NULL,                    'Helal Ahmed',     '01911001014'),
    (2021015, '2002-07-16', 'A-',  'F', 'Sulfa drugs',           'Amin Yasmin',     '01911001015'),
    (2021016, '2002-03-22', 'B-',  'M', NULL,                    'Jalal Haque',     '01911001016'),
    (2021017, '2000-09-08', 'AB+', 'F', NULL,                    'Kamrul Nahar',    '01911001017'),
    (2021018, '1999-12-30', 'O-',  'M', 'NSAIDs',                'Habib Islam',     '01911001018'),
    (2021019, '2002-05-03', 'A+',  'F', NULL,                    'Milon Akter',     '01911001019'),
    (2021020, '2002-08-19', 'B+',  'M', NULL,                    'Nazrul Karim',    '01911001020');

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
    ('Specialist Consultation',  'consultation', 500.00,  'Specialist or cardiology consultation'),
    ('Complete Blood Count',     'lab',          300.00,  'CBC with differential'),
    ('Blood Glucose Test',       'lab',          150.00,  'Fasting blood sugar test'),
    ('Urine Analysis',           'lab',          200.00,  'Complete urinalysis'),
    ('Lipid Profile',            'lab',          450.00,  'Cholesterol and triglycerides panel'),
    ('ECG',                      'procedure',    400.00,  'Electrocardiogram'),
    ('X-Ray (Chest)',            'procedure',    600.00,  'Chest X-ray PA view'),
    ('Wound Dressing',           'procedure',    150.00,  'Minor wound care and dressing'),
    ('Emergency Assessment',     'other',        300.00,  'Emergency triage and initial assessment');

-- -----------------------------------------------------------------
--  LAB TEST CATALOG
-- -----------------------------------------------------------------
INSERT INTO lab_test_catalog (test_name, description, normal_range, unit, service_id) VALUES
    ('Complete Blood Count',    'Full blood count with differential',  '4.5-11.0',     '10^3/µL', 3),
    ('Fasting Blood Sugar',     'Glucose after 8hr fast',              '70-100',       'mg/dL',   4),
    ('Urinalysis',              'Physical/chemical/microscopic exam',  'N/A',          NULL,      5),
    ('Total Cholesterol',       'Total blood cholesterol',             '< 200',        'mg/dL',   6),
    ('HDL Cholesterol',         'High-density lipoprotein',            '40-60',        'mg/dL',   6),
    ('LDL Cholesterol',         'Low-density lipoprotein',             '< 100',        'mg/dL',   6),
    ('Triglycerides',           'Blood triglyceride level',            '< 150',        'mg/dL',   6),
    ('Hemoglobin',              'Blood hemoglobin concentration',      '12.0-17.5',    'g/dL',    3),
    ('ESR',                     'Erythrocyte sedimentation rate',      '0-20',         'mm/hr',   3),
    ('Serum Creatinine',        'Kidney function marker',              '0.7-1.3',      'mg/dL',   NULL);

-- -----------------------------------------------------------------
--  SAMPLE APPOINTMENTS
-- -----------------------------------------------------------------
INSERT INTO appointments (patient_id, medical_staff_id, scheduled_time, reason, status) VALUES
    (1, 1001, NOW() - INTERVAL '10 days', 'Persistent headache',        'completed'),
    (2, 1001, NOW() - INTERVAL '7 days',  'Follow-up asthma checkup',   'completed'),
    (3, 1002, NOW() - INTERVAL '5 days',  'Chest pain evaluation',      'completed'),
    (4, 1001, NOW() - INTERVAL '3 days',  'Seasonal allergy symptoms',  'completed'),
    (5, 1002, NOW() + INTERVAL '1 day',   'Annual health checkup',      'confirmed'),
    (6, 1001, NOW() + INTERVAL '2 days',  'Skin rash consultation',     'scheduled'),
    (7, 1002, NOW() + INTERVAL '3 days',  'Routine blood work review',  'scheduled'),
    (1, 1001, NOW() + INTERVAL '5 days',  'Follow-up headache',         'scheduled');

-- -----------------------------------------------------------------
--  SAMPLE CONSULTATIONS
-- -----------------------------------------------------------------
INSERT INTO consultations (patient_id, medical_staff_id, appointment_id, consult_time, notes) VALUES
    (1, 1001, 1, NOW() - INTERVAL '10 days', 'Patient presents with recurring headaches. No neurological signs. Advised lifestyle changes.'),
    (2, 1001, 2, NOW() - INTERVAL '7 days',  'Asthma well controlled on current inhaler. Continue current medication.'),
    (3, 1002, 3, NOW() - INTERVAL '5 days',  'Chest pain non-cardiac in origin. Likely musculoskeletal. ECG normal.'),
    (4, 1001, 4, NOW() - INTERVAL '3 days',  'Allergic rhinitis flare-up. Prescribed antihistamines.'),
    (5, 1011, NULL, NOW() - INTERVAL '2 days', 'Walk-in: Minor cut on left hand. Cleaned and dressed wound.');

-- -----------------------------------------------------------------
--  SAMPLE VITAL SIGNS
-- -----------------------------------------------------------------
INSERT INTO vital_signs (consult_id, bp, pulse, temp, respiratory_rate, oxygen_saturation, blood_glucose, weight, height) VALUES
    (1, '120/80',  72, 98.6, 16, 98.00, 95.00,  65.50, 165.00),
    (2, '118/76',  68, 98.2, 14, 99.00, 88.00,  70.20, 172.00),
    (3, '130/85',  80, 98.4, 18, 97.50, 92.00,  80.00, 175.00),
    (4, '122/78',  74, 99.0, 16, 98.50, 90.00,  55.00, 160.00),
    (5, '115/72',  66, 98.0, 15, 99.50, 85.00,  58.30, 155.00);

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
    (1, 1013, '8.2 x10^3/µL',  'Within normal range',          'completed', NOW() - INTERVAL '9 days'),
    (2, 1013, '92 mg/dL',       'Normal fasting glucose',       'completed', NOW() - INTERVAL '9 days'),
    (3, NULL,  NULL,             NULL,                           'pending',   NULL);

-- -----------------------------------------------------------------
--  SAMPLE NOTIFICATIONS
-- -----------------------------------------------------------------
INSERT INTO notifications (recipient_type, recipient_id, title, message) VALUES
    ('student', 2021001, 'Lab Results Ready',         'Your Complete Blood Count results are now available.'),
    ('student', 2021001, 'Upcoming Appointment',      'Reminder: You have a follow-up appointment in 5 days.'),
    ('student', 2021005, 'Appointment Confirmed',     'Your annual health checkup has been confirmed.'),
    ('staff',   1001,    'New Patient Assignment',     'You have 3 new appointments scheduled this week.'),
    ('staff',   1013,    'Pending Lab Tests',          'There are 1 pending lab tests awaiting processing.');
