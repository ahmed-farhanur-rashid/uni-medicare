package com.uni.medicare.billing;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.dto.InvoiceResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService service;

    @GetMapping("/invoices/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<InvoiceResponse> getMyInvoices(@AuthenticationPrincipal AppUserDetails user) {
        return service.getStudentInvoices(user.getId())
                .stream().map(InvoiceResponse::fromEntity).toList();
    }

    @PostMapping("/invoices/{id}/pay")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> pay(
            @PathVariable int id,
            @AuthenticationPrincipal AppUserDetails user) {
        PaymentGatewayResponse response = service.payInvoice(id, user.getId());
        if (!response.success()) {
            return ResponseEntity.status(402).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/invoices/{id}/line-items")
    @PreAuthorize("hasRole('RECEPTIONIST')")
    public ResponseEntity<Void> addLineItem(
            @PathVariable int id,
            @RequestBody AddLineItemRequest req) {
        service.addLineItem(id, req);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/invoices/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN')")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(InvoiceResponse.fromEntity(service.updateStatus(id, body.get("status"))));
    }
}
