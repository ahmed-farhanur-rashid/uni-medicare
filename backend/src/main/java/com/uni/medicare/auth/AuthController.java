package com.uni.medicare.auth;

import com.uni.medicare.auth.emailverification.EmailVerificationService;
import com.uni.medicare.auth.passwordreset.PasswordResetService;
import com.uni.medicare.shared.email.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService                  authService;
    private final EmailVerificationService     emailVerificationService;
    private final PasswordResetService         passwordResetService;
    private final EmailService                 emailService;

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** POST /api/auth/register — new student self-registration */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String verificationToken = authService.register(request);
        String verificationUrl = emailVerificationService.getVerificationUrl(verificationToken);
        log.info("Email verification URL for {}: {}", request.email(), verificationUrl);

        // Send verification email if email is provided
        if (request.email() != null && !request.email().isBlank()) {
            emailService.sendVerificationEmail(request.email(), verificationUrl);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful. Please check your email to verify your account.",
                "verificationUrl", verificationUrl
        ));
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
            passwordResetService.forgotPassword(email)
                    .ifPresent(token -> {
                        String resetUrl = passwordResetService.getResetUrl(token);
                        log.info("Password reset URL for {}: {}", email, resetUrl);
                        emailService.sendPasswordResetEmail(email, resetUrl);
                    });
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

    /** POST /api/auth/resend-verification */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null && !email.isBlank()) {
            authService.resendVerification(email);
        }
        return ResponseEntity.ok(Map.of("message", "If the email exists, a verification link has been sent"));
    }
}
