package com.uni.medicare.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
        @NotNull String recipientType,
        @NotNull Integer recipientId,
        @NotBlank String title,
        @NotBlank String message
) {}
