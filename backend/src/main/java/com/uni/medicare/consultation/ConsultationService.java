package com.uni.medicare.consultation;

import com.uni.medicare.appointment.Appointment;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Patient;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultRepo;
    private final EntityManager          em;

    public List<Consultation> getForPatient(int patientId) {
        return consultRepo.findByPatient_PatientId(patientId);
    }

    public List<Consultation> getForDoctor(int staffId) {
        return consultRepo.findByMedicalStaff_MedicalStaffId(staffId);
    }

    /** Open a new consultation. Rule 3: appointment must not be completed/cancelled. */
    @Transactional
    public Consultation open(OpenConsultationRequest req) {

        Patient      patient = em.find(Patient.class, req.patientId());
        MedicalStaff staff   = em.find(MedicalStaff.class, req.staffId());
        if (patient == null) throw new EntityNotFoundException("Patient not found");
        if (staff   == null) throw new EntityNotFoundException("Staff not found");

        Appointment appt = null;
        if (req.appointmentId() != null) {
            appt = em.find(Appointment.class, req.appointmentId());
            if (appt == null) throw new EntityNotFoundException("Appointment not found");
            if ("completed".equals(appt.getStatus()) || "cancelled".equals(appt.getStatus())) {
                throw new IllegalStateException(
                        "Cannot open consultation for a " + appt.getStatus() + " appointment");
            }
        }

        Consultation c = new Consultation();
        c.setPatient(patient);
        c.setMedicalStaff(staff);
        c.setAppointment(appt);
        return consultRepo.save(c);
    }

    /** Doctor writes notes — PATCH /{id}/notes */
    @Transactional
    public Consultation addNotes(int consultId, String notes) {
        Consultation c = consultRepo.findById(consultId)
                .orElseThrow(() -> new EntityNotFoundException("Consultation not found"));
        c.setNotes(notes);
        return consultRepo.save(c);
    }
}
