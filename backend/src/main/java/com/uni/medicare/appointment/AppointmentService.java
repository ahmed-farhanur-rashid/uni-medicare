package com.uni.medicare.appointment;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.billing.Transaction;
import com.uni.medicare.shared.entity.*;
import com.uni.medicare.shared.repository.AccountRepository;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final PatientRepository patientRepo;
    private final AccountRepository accountRepo;
    private final EntityManager em;

    public static final BigDecimal DEPOSIT_AMOUNT = new BigDecimal("50.00");

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

    /** Book appointment — STUDENT, RECEPTIONIST, NURSE. Deducts deposit from student account. */
    @Transactional
    public Appointment book(BookAppointmentRequest req, AppUserDetails actor) {

        Patient patient;
        Account depositAccount = null;

        if ("student".equals(actor.getType())) {
            patient = patientRepo.findByStudent_StudentId(actor.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No patient profile found"));
            depositAccount = patient.getStudent().getAccount();
            if (depositAccount.getBalance().compareTo(DEPOSIT_AMOUNT) < 0) {
                throw new IllegalStateException("Insufficient balance. Required: " + DEPOSIT_AMOUNT);
            }
            depositAccount.setBalance(depositAccount.getBalance().subtract(DEPOSIT_AMOUNT));

            Transaction tx = new Transaction();
            tx.setAccount(depositAccount);
            tx.setTransType("appointment_deposit");
            tx.setAmount(DEPOSIT_AMOUNT.negate());
            tx.setReferenceNote("Deposit for appointment booking");
            em.persist(tx);
        } else {
            patient = em.find(Patient.class, req.patientId());
            if (patient == null) throw new EntityNotFoundException("Patient not found");
        }

        MedicalStaff doctor = em.find(MedicalStaff.class, req.doctorId());
        if (doctor == null) throw new EntityNotFoundException("Doctor not found");

        // Check slot not already booked
        if (appointmentRepo.existsConflict(req.doctorId(), req.scheduledTime())) {
            throw new IllegalStateException("Doctor already has an appointment at this time");
        }

        Appointment appt = new Appointment();
        appt.setPatient(patient);
        appt.setMedicalStaff(doctor);
        appt.setScheduledTime(req.scheduledTime());
        appt.setReason(req.reason());
        appt.setStatus("booked");
        appt.setDepositAmount(DEPOSIT_AMOUNT);
        appt.setRefundAmount(BigDecimal.ZERO);
        appt.setDepositAccount(depositAccount);

        return appointmentRepo.save(appt);
    }

    /** Status transition — DOCTOR, RECEPTIONIST, NURSE */
    @Transactional
    public Appointment advanceStatus(int appointmentId, String newStatus) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        String current = appt.getStatus();
        String allowed = switch (current) {
            case "booked"     -> "arrived";
            case "arrived"    -> "in_progress";
            case "in_progress"-> "completed";
            default           -> null;
        };

        if (newStatus == null || !newStatus.equals(allowed)) {
            throw new IllegalStateException(
                "Cannot transition from '" + current + "' to '" + newStatus + "'. Allowed: " + allowed);
        }

        appt.setStatus(newStatus);
        return appointmentRepo.save(appt);
    }

    /** Mark as no-show — DOCTOR or RECEPTIONIST */
    @Transactional
    public Appointment markNoShow(int appointmentId) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if (!"booked".equals(appt.getStatus()) && !"arrived".equals(appt.getStatus())) {
            throw new IllegalStateException("Cannot mark no-show from status: " + appt.getStatus());
        }

        appt.setStatus("no_show");
        appt.setRefundAmount(BigDecimal.ZERO);
        return appointmentRepo.save(appt);
    }

    /** Cancel appointment — STUDENT cancels own, RECEPTIONIST cancels any */
    @Transactional
    public Appointment cancel(int appointmentId, String reason, AppUserDetails actor) {
        Appointment appt = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found"));

        if ("completed".equals(appt.getStatus()) || "no_show".equals(appt.getStatus()) || "cancelled".equals(appt.getStatus())) {
            throw new IllegalStateException("Cannot cancel appointment in status: " + appt.getStatus());
        }

        // Student can only cancel own appointment
        if ("student".equals(actor.getType())) {
            Patient patient = patientRepo.findByStudent_StudentId(actor.getId())
                    .orElseThrow(() -> new EntityNotFoundException("No patient profile"));
            if (!patient.getPatientId().equals(appt.getPatient().getPatientId())) {
                throw new IllegalStateException("Cannot cancel another patient's appointment");
            }
        }

        appt.setStatus("cancelled");
        appt.setCancellationReason(reason);

        // Refund logic: 2+ hours before → 2/3 refund, otherwise → no refund
        if (appt.getDepositAccount() != null && appt.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            LocalDateTime twoHoursBefore = appt.getScheduledTime().minusHours(2);
            BigDecimal refund;

            if (LocalDateTime.now().isBefore(twoHoursBefore)) {
                // More than 2 hours before → 2/3 refund
                refund = appt.getDepositAmount()
                        .multiply(new BigDecimal("2"))
                        .divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);
            } else {
                // Within 2 hours or no-show → no refund
                refund = BigDecimal.ZERO;
            }

            appt.setRefundAmount(refund);

            if (refund.compareTo(BigDecimal.ZERO) > 0) {
                Account acct = appt.getDepositAccount();
                acct.setBalance(acct.getBalance().add(refund));

                Transaction tx = new Transaction();
                tx.setAccount(acct);
                tx.setTransType("appointment_refund");
                tx.setAmount(refund);
                tx.setReferenceNote("Refund for cancelled appointment #" + appt.getAppointmentId());
                em.persist(tx);
            }
        }

        return appointmentRepo.save(appt);
    }

    /** Background job: mark BOOKED appointments past their scheduled time as NO_SHOW */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void markNoShows() {
        List<Appointment> booked = appointmentRepo.findByStatusAndScheduledTimeBefore(
                "booked", LocalDateTime.now());

        for (Appointment appt : booked) {
            appt.setStatus("no_show");
            appt.setRefundAmount(BigDecimal.ZERO);
            log.info("Auto no-show for appointment #{}", appt.getAppointmentId());
        }

        if (!booked.isEmpty()) {
            appointmentRepo.saveAll(booked);
        }
    }
}
