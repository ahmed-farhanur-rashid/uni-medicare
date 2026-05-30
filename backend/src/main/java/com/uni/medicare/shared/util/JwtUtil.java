package com.uni.medicare.shared.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

/**
 * Handles JWT creation and parsing.
 *
 * Token payload contains:
 *   sub  — eID (student_id or medical_staff_id as String)
 *   role — e.g. DOCTOR, STUDENT, ADMIN …
 *   type — "student" or "staff"
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String base64Secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(base64Secret));
        this.expirationMs = expirationMs;
    }

    /** Generate a signed JWT. */
    public String generateToken(int id, String role, String type) {
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claims(Map.of("role", role, "type", type))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    /** Parse and validate; throws JwtException on failure. */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public int extractId(String token) {
        return Integer.parseInt(extractClaims(token).getSubject());
    }

    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    public String extractType(String token) {
        return (String) extractClaims(token).get("type");
    }

    public boolean isValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
