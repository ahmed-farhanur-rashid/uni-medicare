package com.uni.medicare.auth;

/** Response body for a successful login */
public record LoginResponse(
        String token,
        int    id,
        String role,
        String type    // "student" or "staff"
) {}
