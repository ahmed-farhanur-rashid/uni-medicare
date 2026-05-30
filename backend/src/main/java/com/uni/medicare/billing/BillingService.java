package com.uni.medicare.billing;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final InvoiceRepository invoiceRepo;
    private final EntityManager     em;
    private final JdbcTemplate      jdbc;
    private final MockPaymentGateway paymentGateway;

    @Value("${app.medical-center-account-id:1}")
    private int medicalCenterAccountId;

    public List<Invoice> getStudentInvoices(int studentId) {
        return invoiceRepo.findByStudent_StudentId(studentId);
    }

    /**
     * Pay invoice via MockPaymentGateway, then call transfer_funds DB function.
     * Rule 5: student cannot overpay — the function RAISE EXCEPTION on insufficient funds.
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

        // Gateway approved — execute the PostgreSQL function
        jdbc.execute("""
            SELECT transfer_funds(%d, %d, %s)
            """.formatted(studentId, medicalCenterAccountId, invoice.getTotalAmount()));

        return gatewayResponse;
    }

    /**
     * Add a line item by calling the add_invoice_line_item PostgreSQL function.
     * The function inserts the row and recalculates invoice total_amount.
     */
    @Transactional
    public void addLineItem(int invoiceId, AddLineItemRequest req) {
        invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));

        jdbc.execute("""
            SELECT add_invoice_line_item(%d, %d, '%s', %d, %s)
            """.formatted(
                invoiceId,
                req.serviceId(),
                req.description().replace("'", "''"),
                req.quantity(),
                req.unitPrice()));
    }

    @Transactional
    public Invoice updateStatus(int invoiceId, String status) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found"));
        invoice.setTransactionStatus(status);
        return invoiceRepo.save(invoice);
    }
}
