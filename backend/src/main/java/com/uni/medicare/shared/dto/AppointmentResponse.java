package com.uni.medicare.shared.dto;

import com.uni.medicare.appointment.Appointment;
import java.time.LocalDateTime;

public record AppointmentResponse(
        Integer appointmentId,
        Integer patientId,
        String patientName,
        Integer doctorId,
        String doctorName,
        String department,
        LocalDateTime scheduledTime,
        String reason,
        String status,
        String cancellationReason,
        LocalDateTime createdAt
) {
    public static AppointmentResponse fromEntity(Appointment a) {
        return new AppointmentResponse(
                a.getAppointmentId(),
                a.getPatient().getPatientId(),
                a.getPatient().getStudent() != null ? a.getPatient().getStudent().getName() : null,
                a.getMedicalStaff().getMedicalStaffId(),
                a.getMedicalStaff().getName(),
                a.getMedicalStaff().getDepartment() != null ? a.getMedicalStaff().getDepartment().getName() : null,
                a.getScheduledTime(), a.getReason(), a.getStatus(),
                a.getCancellationReason(), a.getCreatedAt()
        );
    }
}
