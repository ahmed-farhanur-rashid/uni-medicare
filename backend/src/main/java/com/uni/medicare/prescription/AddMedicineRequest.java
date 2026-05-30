package com.uni.medicare.prescription;

import jakarta.validation.constraints.NotBlank;

public record AddMedicineRequest(
        @NotBlank String medicineName,
        String dosage,
        String frequency,
        Integer days,
        String instructions
) {}
