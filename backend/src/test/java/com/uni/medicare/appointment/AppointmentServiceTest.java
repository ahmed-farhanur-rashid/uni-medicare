package com.uni.medicare.appointment;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepo;
    @Mock private PatientRepository patientRepo;
    @Mock private EntityManager em;

    @InjectMocks private AppointmentService appointmentService;

    private Patient patient;
    private MedicalStaff doctor;
    private AppUserDetails studentActor;
    private AppUserDetails receptionistActor;

    @BeforeEach
    void setUp() {
        Student studentEntity = new Student();
        studentEntity.setStudentId(1);

        patient = new Patient();
        patient.setPatientId(10);
        patient.setStudent(studentEntity);

        doctor = new MedicalStaff();
        doctor.setMedicalStaffId(20);

        studentActor = new AppUserDetails(1, "pass", "STUDENT", "student", true);
        receptionistActor = new AppUserDetails(5, "pass", "RECEPTIONIST", "staff", true);
    }

    @Test
    void book_success() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                10, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(em.find(Patient.class, 10)).thenReturn(patient);
        when(em.find(MedicalStaff.class, 20)).thenReturn(doctor);

        @SuppressWarnings("unchecked")
        TypedQuery<Boolean> scheduleQuery = mock(TypedQuery.class);
        when(em.createQuery(anyString(), eq(Boolean.class))).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("staffId", 20)).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("day", 1)).thenReturn(scheduleQuery); // Monday = 1 % 7 = 1
        when(scheduleQuery.getSingleResult()).thenReturn(true);

        when(appointmentRepo.existsConflict(20, LocalDateTime.of(2025, 6, 1, 10, 0))).thenReturn(false);
        when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            a.setAppointmentId(1);
            return a;
        });

        Appointment result = appointmentService.book(req, receptionistActor);

        assertThat(result).isNotNull();
        assertThat(result.getPatient()).isEqualTo(patient);
        assertThat(result.getMedicalStaff()).isEqualTo(doctor);
        assertThat(result.getStatus()).isEqualTo("scheduled");
        verify(appointmentRepo).save(any(Appointment.class));
    }

    @Test
    void book_student_auto_resolve() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                null, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(patientRepo.findByStudent_StudentId(1)).thenReturn(Optional.of(patient));
        when(em.find(MedicalStaff.class, 20)).thenReturn(doctor);

        @SuppressWarnings("unchecked")
        TypedQuery<Boolean> scheduleQuery = mock(TypedQuery.class);
        when(em.createQuery(anyString(), eq(Boolean.class))).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("staffId", 20)).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("day", 1)).thenReturn(scheduleQuery);
        when(scheduleQuery.getSingleResult()).thenReturn(true);

        when(appointmentRepo.existsConflict(20, LocalDateTime.of(2025, 6, 1, 10, 0))).thenReturn(false);
        when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> {
            Appointment a = inv.getArgument(0);
            a.setAppointmentId(1);
            return a;
        });

        Appointment result = appointmentService.book(req, studentActor);

        assertThat(result.getPatient()).isEqualTo(patient);
        verify(patientRepo).findByStudent_StudentId(1);
        verify(em, never()).find(Patient.class, anyInt());
    }

    @Test
    void book_no_schedule() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                10, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(em.find(Patient.class, 10)).thenReturn(patient);
        when(em.find(MedicalStaff.class, 20)).thenReturn(doctor);

        @SuppressWarnings("unchecked")
        TypedQuery<Boolean> scheduleQuery = mock(TypedQuery.class);
        when(em.createQuery(anyString(), eq(Boolean.class))).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("staffId", 20)).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("day", 1)).thenReturn(scheduleQuery);
        when(scheduleQuery.getSingleResult()).thenReturn(false);

        assertThatThrownBy(() -> appointmentService.book(req, receptionistActor))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("no schedule");
    }

    @Test
    void book_conflict() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                10, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(em.find(Patient.class, 10)).thenReturn(patient);
        when(em.find(MedicalStaff.class, 20)).thenReturn(doctor);

        @SuppressWarnings("unchecked")
        TypedQuery<Boolean> scheduleQuery = mock(TypedQuery.class);
        when(em.createQuery(anyString(), eq(Boolean.class))).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("staffId", 20)).thenReturn(scheduleQuery);
        when(scheduleQuery.setParameter("day", 1)).thenReturn(scheduleQuery);
        when(scheduleQuery.getSingleResult()).thenReturn(true);

        when(appointmentRepo.existsConflict(20, LocalDateTime.of(2025, 6, 1, 10, 0))).thenReturn(true);

        assertThatThrownBy(() -> appointmentService.book(req, receptionistActor))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already has an appointment");
    }

    @Test
    void book_patient_not_found() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                999, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(em.find(Patient.class, 999)).thenReturn(null);

        assertThatThrownBy(() -> appointmentService.book(req, receptionistActor))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Patient not found");
    }

    @Test
    void book_student_no_patient_profile() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                null, 20, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(patientRepo.findByStudent_StudentId(1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.book(req, studentActor))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("No patient profile found");
    }

    @Test
    void book_doctor_not_found() {
        BookAppointmentRequest req = new BookAppointmentRequest(
                10, 999, LocalDateTime.of(2025, 6, 1, 10, 0), "Checkup");

        when(em.find(Patient.class, 10)).thenReturn(patient);
        when(em.find(MedicalStaff.class, 999)).thenReturn(null);

        assertThatThrownBy(() -> appointmentService.book(req, receptionistActor))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Doctor not found");
    }
}
