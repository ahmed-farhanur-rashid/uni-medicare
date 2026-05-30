package com.uni.medicare.appointment;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record BookAppointmentRequest(
        Integer patientId,
        @NotNull Integer doctorId,
        @NotNull LocalDateTime scheduledTime,
        String reason
) {}
