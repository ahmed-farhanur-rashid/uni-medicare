package com.uni.medicare.shared.dto;

import com.uni.medicare.vital.VitalSign;
import java.math.BigDecimal;

public record VitalSignsResponse(
        Integer consultId,
        String bp,
        Integer pulse,
        BigDecimal temp,
        Integer respiratoryRate,
        BigDecimal oxygenSaturation,
        BigDecimal bloodGlucose,
        BigDecimal weight,
        BigDecimal height,
        BigDecimal bmi
) {
    public static VitalSignsResponse fromEntity(VitalSign v) {
        return new VitalSignsResponse(
                v.getConsultId(), v.getBp(), v.getPulse(), v.getTemp(),
                v.getRespiratoryRate(), v.getOxygenSaturation(), v.getBloodGlucose(),
                v.getWeight(), v.getHeight(), v.getBmi()
        );
    }
}
