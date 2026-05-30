-- =================================================================
--  Uni Medicare — Trigger Functions + Trigger Bindings
--  PostgreSQL 16+
-- =================================================================

-- -----------------------------------------------------------------
--  Shared: set_updated_at()
--  Replaces MySQL's ON UPDATE CURRENT_TIMESTAMP.
--  Attach to any table that has an updated_at column.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Attach to all tables with updated_at
CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_medical_staffs_updated_at
    BEFORE UPDATE ON medical_staffs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- -----------------------------------------------------------------
--  generate_invoice_after_vitals
--  Creates a pending invoice automatically when a nurse records vitals.
-- -----------------------------------------------------------------
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


-- -----------------------------------------------------------------
--  complete_appointment_on_consult
--  Marks the appointment as completed when a consultation is opened.
-- -----------------------------------------------------------------
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


-- -----------------------------------------------------------------
--  audit_student_status_change
--  Writes to audit_logs when a student's is_active flag changes.
-- -----------------------------------------------------------------
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
