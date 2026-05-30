package com.uni.medicare.prescription;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreatePrescriptionRequest(
        @NotNull Integer consultId,
        String chiefComplaint,
        String diagnosis,
        LocalDate followUpDate
) {}
