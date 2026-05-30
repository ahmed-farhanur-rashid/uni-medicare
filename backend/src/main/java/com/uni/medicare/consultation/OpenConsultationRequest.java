package com.uni.medicare.consultation;

import jakarta.validation.constraints.NotNull;

public record OpenConsultationRequest(
        @NotNull Integer patientId,
        @NotNull Integer staffId,
        Integer appointmentId   // nullable — walk-in
) {}
