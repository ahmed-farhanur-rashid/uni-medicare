package com.uni.medicare.appointment;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.dto.AppointmentResponse;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;
    private final PatientRepository   patientRepo;

    /** GET /api/appointments — RECEPTIONIST, ADMIN */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN')")
    public List<AppointmentResponse> getAll() {
        return service.getAll().stream().map(AppointmentResponse::fromEntity).toList();
    }

    /** GET /api/appointments/my — STUDENT sees own, DOCTOR sees own schedule */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','DOCTOR')")
    public List<AppointmentResponse> getMy(@AuthenticationPrincipal AppUserDetails user) {
        if ("student".equals(user.getType())) {
            Patient patient = patientRepo.findByStudent_StudentId(user.getId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                            "No patient profile found for this student"));
            return service.getForPatient(patient.getPatientId())
                    .stream().map(AppointmentResponse::fromEntity).toList();
        }
        return service.getForDoctor(user.getId())
                .stream().map(AppointmentResponse::fromEntity).toList();
    }

    /** POST /api/appointments — STUDENT, RECEPTIONIST, NURSE */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','RECEPTIONIST','NURSE')")
    public ResponseEntity<AppointmentResponse> book(
            @Valid @RequestBody BookAppointmentRequest req,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(AppointmentResponse.fromEntity(service.book(req, user)));
    }

    /** PATCH /api/appointments/{id}/status — RECEPTIONIST, ADMIN */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(AppointmentResponse.fromEntity(
                service.updateStatus(id, body.get("status"), body.get("reason"))));
    }
}
