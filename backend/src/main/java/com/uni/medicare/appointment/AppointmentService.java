package com.uni.medicare.appointment;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.entity.StaffSchedule;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository     patientRepo;
    private final EntityManager         em;

    /** RECEPTIONIST, ADMIN — all appointments */
    public List<Appointment> getAll() {
        return appointmentRepo.findAll();
    }

    /** STUDENT — own appointments via patient record */
    public List<Appointment> getForPatient(int patientId) {
        return appointmentRepo.findByPatient_PatientId(patientId);
    }

    /** DOCTOR — own schedule */
    public List<Appointment> getForDoctor(int staffId) {
        return appointmentRepo.findByMedicalStaff_MedicalStaffId(staffId);
    }

    /** Book appointment — STUDENT, RECEPTIONIST, NURSE */
    @Transactional
    public Appointment book(BookAppointmentRequest req, AppUserDetails actor) {

        Patient patient;
        if ("student".equals(actor.getType())) {
            patient = patientRepo.findByStudent_StudentId(actor.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No patient profile found"));
        } else {
            patient = em.find(Patient.class, req.patientId());
            if (patient == null) throw new EntityNotFoundException("Patient not found");
        }
        MedicalStaff doctor = em.find(MedicalStaff.class, req.doctorId());

        if (doctor == null) throw new EntityNotFoundException("Doctor not found");

        // Rule 2: doctor must have a schedule entry for the requested day
        int dayOfWeek = req.scheduledTime().getDayOfWeek().getValue() % 7; // 0=Sun … 6=Sat
        boolean hasSchedule = em.createQuery("""
            SELECT COUNT(s) > 0 FROM StaffSchedule s
            WHERE s.medicalStaff.medicalStaffId = :staffId
              AND s.dayOfWeek = :day
        """, Boolean.class)
        .setParameter("staffId", req.doctorId())
        .setParameter("day", dayOfWeek)
        .getSingleResult();

        if (!hasSchedule) {
            throw new IllegalStateException("Doctor has no schedule for the requested day");
        }

        // Conflict check
        if (appointmentRepo.existsConflict(req.doctorId(), req.scheduledTime())) {
            throw new IllegalStateException("Doctor already has an appointment at this time");
        }

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setMedicalStaff(doctor);
        appt.setScheduledTime(req.scheduledTime());
        appt.setReason(req.reason());
        appt.setStatus("scheduled");

        return appointmentRepo.save(appt);
    }

    /** Update appointment status — RECEPTIONIST, ADMIN */
    @Transactional
    public Appointment updateStatus(int appointmentId, String newStatus, String reason) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));
        appt.setStatus(newStatus);
        if (reason != null) appt.setCancellationReason(reason);
        return appointmentRepo.save(appt);
    }
}
