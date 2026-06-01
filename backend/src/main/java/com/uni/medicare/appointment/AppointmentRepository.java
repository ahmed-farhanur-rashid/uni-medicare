package com.uni.medicare.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    // All appointments for a specific patient
    List<Appointment> findByPatient_PatientId(Integer patientId);

    // All appointments for a specific doctor
    List<Appointment> findByMedicalStaff_MedicalStaffId(Integer staffId);

    // Conflict check: doctor already has appointment overlapping the requested slot
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.medicalStaff.medicalStaffId = :staffId
          AND a.scheduledTime = :scheduledTime
          AND a.status NOT IN ('cancelled', 'no_show')
    """)
    boolean existsConflict(Integer staffId, LocalDateTime scheduledTime);

    // Find all appointments with a given status that are past their scheduled time
    List<Appointment> findByStatusAndScheduledTimeBefore(String status, LocalDateTime before);
}
