-- =================================================================
--  Uni Medicare — PL/pgSQL Functions
--  PostgreSQL 16+
-- =================================================================

-- -----------------------------------------------------------------
--  transfer_funds
--  Deducts from student account, credits the medical center,
--  records transactions, and marks the oldest pending invoice as paid.
-- -----------------------------------------------------------------
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
    -- Look up the student's account
    SELECT account_id INTO v_student_account_id
    FROM students WHERE student_id = p_sender_student_id;

    IF v_student_account_id IS NULL THEN
        RAISE EXCEPTION 'Student not found';
    END IF;

    -- Lock the student's account row and read balance
    SELECT balance INTO v_student_balance
    FROM accounts WHERE account_id = v_student_account_id
    FOR UPDATE;

    IF v_student_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Debit student, credit medical center
    UPDATE accounts SET balance = balance - p_amount WHERE account_id = v_student_account_id;
    UPDATE accounts SET balance = balance + p_amount WHERE account_id = p_medical_center_account_id;

    -- Record student's payment transaction
    INSERT INTO transactions (account_id, trans_type, amount)
    VALUES (v_student_account_id, 'Made Payment', p_amount)
    RETURNING transaction_id INTO v_transaction_id;

    -- Record medical center's received payment transaction
    INSERT INTO transactions (account_id, trans_type, amount)
    VALUES (p_medical_center_account_id, 'Received Payment', p_amount);

    -- Pay the oldest pending invoice for this student
    SELECT invoice_id INTO v_invoice_id
    FROM invoices
    WHERE student_id = p_sender_student_id AND transaction_status = 'pending'
    ORDER BY invoice_date ASC
    LIMIT 1;

    IF v_invoice_id IS NOT NULL THEN
        UPDATE invoices
        SET transaction_status = 'paid', transaction_id = v_transaction_id
        WHERE invoice_id = v_invoice_id;
    END IF;
END;
$$;


-- -----------------------------------------------------------------
--  add_invoice_line_item
--  Inserts a line item and recalculates the invoice total.
-- -----------------------------------------------------------------
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
