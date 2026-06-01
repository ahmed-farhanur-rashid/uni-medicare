package com.uni.medicare.wallet;

import com.uni.medicare.auth.AppUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getBalance(@AuthenticationPrincipal AppUserDetails user) {
        BigDecimal balance = walletService.getBalance(user.getId());
        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @PostMapping("/topup")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> topUp(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal AppUserDetails user) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount must be positive"));
        }
        var account = walletService.topUp(user.getId(), amount);
        return ResponseEntity.ok(Map.of(
                "balance", account.getBalance(),
                "message", "Wallet topped up successfully"
        ));
    }
}
