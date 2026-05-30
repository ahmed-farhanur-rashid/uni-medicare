package com.uni.medicare.auth;

import jakarta.validation.constraints.NotNull;

/** Request body for POST /api/auth/login */
public record LoginRequest(
        @NotNull Integer eId,        // student_id OR medical_staff_id
        @NotNull String password
) {}
