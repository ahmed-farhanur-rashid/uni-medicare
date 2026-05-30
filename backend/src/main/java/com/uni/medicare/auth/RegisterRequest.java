package com.uni.medicare.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RegisterRequest(
        @NotNull Integer studentId,
        @NotBlank String name,
        @Email String email,
        String phone,
        @NotBlank @Size(min = 8) String password,
        @NotNull LocalDate dateOfBirth,
        String bloodgroup,
        String sex
) {}
