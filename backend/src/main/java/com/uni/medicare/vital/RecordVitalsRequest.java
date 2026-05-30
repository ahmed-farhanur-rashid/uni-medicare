package com.uni.medicare.vital;

import java.math.BigDecimal;

public record RecordVitalsRequest(
        String bp,
        Integer pulse,
        BigDecimal temp,
        Integer respiratoryRate,
        BigDecimal oxygenSaturation,
        BigDecimal bloodGlucose,
        BigDecimal weight,
        BigDecimal height
) {}
