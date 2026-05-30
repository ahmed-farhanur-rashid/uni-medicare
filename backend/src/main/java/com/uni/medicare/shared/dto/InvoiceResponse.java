package com.uni.medicare.shared.dto;

import com.uni.medicare.billing.Invoice;
import com.uni.medicare.billing.InvoiceLineItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(
        Integer invoiceId,
        LocalDateTime invoiceDate,
        BigDecimal totalAmount,
        String transactionStatus,
        Integer consultId,
        Integer studentId,
        String studentName,
        Integer transactionId,
        String notes,
        List<LineItem> lineItems,
        LocalDateTime updatedAt
) {
    public record LineItem(
            Integer lineItemId, String serviceName, String description,
            Integer quantity, BigDecimal unitPrice, BigDecimal totalPrice
    ) {
        public static LineItem from(InvoiceLineItem li) {
            return new LineItem(
                    li.getLineItemId(),
                    li.getService() != null ? li.getService().getServiceName() : null,
                    li.getDescription(), li.getQuantity(), li.getUnitPrice(), li.getTotalPrice()
            );
        }
    }

    public static InvoiceResponse fromEntity(Invoice inv) {
        List<LineItem> items = inv.getLineItems() != null
                ? inv.getLineItems().stream().map(LineItem::from).toList()
                : List.of();
        return new InvoiceResponse(
                inv.getInvoiceId(), inv.getInvoiceDate(), inv.getTotalAmount(),
                inv.getTransactionStatus(), inv.getConsultation().getConsultId(),
                inv.getStudent().getStudentId(), inv.getStudent().getName(),
                inv.getTransaction() != null ? inv.getTransaction().getTransactionId() : null,
                inv.getNotes(), items, inv.getUpdatedAt()
        );
    }
}
