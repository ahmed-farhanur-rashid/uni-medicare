package com.uni.medicare.auth;

import com.uni.medicare.auth.emailverification.EmailVerificationService;
import com.uni.medicare.auth.passwordreset.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService                  authService;
    private final EmailVerificationService     emailVerificationService;
    private final PasswordResetService         passwordResetService;

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** GET /api/auth/verify-email?token=<uuid> */
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    /** POST /api/auth/forgot-password — always returns 200 (don't reveal if email exists) */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null && !email.isBlank()) {
            passwordResetService.forgotPassword(email);
        }
        return ResponseEntity.ok(Map.of("message", "If the email exists, a reset link has been sent"));
    }

    /** POST /api/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        passwordResetService.resetPassword(token, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}
