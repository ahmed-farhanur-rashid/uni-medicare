package com.uni.medicare.billing;

import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final EntityManager     em;
    private final DataSource        dataSource;
    private final MockPaymentGateway paymentGateway;

    @Value("${app.medical-center-account-id:1}")
    private int medicalCenterAccountId;

    public List<Invoice> getStudentInvoices(int studentId) {
        return invoiceRepo.findByStudent_StudentId(studentId);
    }

    /**
     * Pay invoice via MockPaymentGateway, then call transfer_funds DB function.
     * Rule 5: student cannot overpay — the procedure signals an error on insufficient funds.
     */
    @Transactional
    public PaymentGatewayResponse payInvoice(int invoiceId, int studentId) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        if (!invoice.getStudent().getStudentId().equals(studentId)) {
            throw new IllegalStateException("Invoice does not belong to this student");
        }
        if (!"pending".equals(invoice.getTransactionStatus())) {
            throw new IllegalStateException("Invoice is already " + invoice.getTransactionStatus());
        }

        // Process through mock payment gateway (90% success / 10% failure)
        PaymentGatewayResponse gatewayResponse = paymentGateway.processPayment(
                invoice.getTotalAmount(), studentId, "Invoice #" + invoiceId);

        if (!gatewayResponse.success()) {
            return gatewayResponse;
        }

        // Gateway approved — execute the fund transfer
        SimpleJdbcCall call = new SimpleJdbcCall(dataSource)
                .withProcedureName("transfer_funds");

        Map<String, Object> params = new HashMap<>();
        params.put("sender_student_id", studentId);
        params.put("medical_center_account_id", medicalCenterAccountId);
        params.put("p_amount", invoice.getTotalAmount());

        call.execute(params);   // throws DataAccessException on SIGNAL (insufficient funds)

        return gatewayResponse;
    }

    /**
     * Add a line item by calling the add_invoice_line_item stored procedure.
     * The procedure inserts the row and recalculates invoice total_amount.
     */
    @Transactional
    public void addLineItem(int invoiceId, AddLineItemRequest req) {
        invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        SimpleJdbcCall call = new SimpleJdbcCall(dataSource)
                .withProcedureName("add_invoice_line_item");

        Map<String, Object> params = new HashMap<>();
        params.put("p_invoice_id",  invoiceId);
        params.put("p_service_id",  req.serviceId());
        params.put("p_description", req.description());
        params.put("p_quantity",    req.quantity());
        params.put("p_unit_price",  req.unitPrice());

        call.execute(params);
    }

    @Transactional
    public Invoice updateStatus(int invoiceId, String status) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        invoice.setTransactionStatus(status);
        return invoiceRepo.save(invoice);
    }
}
