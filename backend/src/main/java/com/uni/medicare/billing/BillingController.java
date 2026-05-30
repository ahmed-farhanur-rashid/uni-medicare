package com.uni.medicare.billing;

import com.uni.medicare.auth.AppUserDetails;
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
    public List<Invoice> getMyInvoices(@AuthenticationPrincipal AppUserDetails user) {
        return service.getStudentInvoices(user.getId());
    }

    @PostMapping("/invoices/{id}/pay")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> pay(
            @PathVariable int id,
            @AuthenticationPrincipal AppUserDetails user) {
        service.payInvoice(id, user.getId());
        return ResponseEntity.ok().build();
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
    public ResponseEntity<Invoice> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.updateStatus(id, body.get("status")));
    }
}
