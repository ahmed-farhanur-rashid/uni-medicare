package com.uni.medicare.auth;

import jakarta.validation.constraints.NotBlank;

/** Request body for POST /api/auth/login */
public record LoginRequest(
        @NotBlank String eId,        // student_id, medical_staff_id, OR email
        @NotBlank String password
) {}
