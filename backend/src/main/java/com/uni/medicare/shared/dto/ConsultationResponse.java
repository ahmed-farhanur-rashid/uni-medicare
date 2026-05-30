package com.uni.medicare.shared.dto;

import com.uni.medicare.consultation.Consultation;
import java.time.LocalDateTime;

public record ConsultationResponse(
        Integer consultId,
        Integer patientId,
        String patientName,
        Integer staffId,
        String staffName,
        Integer appointmentId,
        LocalDateTime consultTime,
        String notes
) {
    public static ConsultationResponse fromEntity(Consultation c) {
        return new ConsultationResponse(
                c.getConsultId(),
                c.getPatient().getPatientId(),
                c.getPatient().getStudent() != null ? c.getPatient().getStudent().getName() : null,
                c.getMedicalStaff().getMedicalStaffId(),
                c.getMedicalStaff().getName(),
                c.getAppointment() != null ? c.getAppointment().getAppointmentId() : null,
                c.getConsultTime(), c.getNotes()
        );
    }
}
