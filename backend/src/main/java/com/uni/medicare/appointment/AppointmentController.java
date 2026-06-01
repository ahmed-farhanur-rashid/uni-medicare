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
    private final PatientRepository patientRepo;

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

    /** PATCH /api/appointments/{id}/advance — DOCTOR, RECEPTIONIST, NURSE */
    @PatchMapping("/{id}/advance")
    @PreAuthorize("hasAnyRole('DOCTOR','RECEPTIONIST','NURSE')")
    public ResponseEntity<AppointmentResponse> advanceStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(AppointmentResponse.fromEntity(
                service.advanceStatus(id, body.get("status"))));
    }

    /** PATCH /api/appointments/{id}/no-show — DOCTOR, RECEPTIONIST */
    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('DOCTOR','RECEPTIONIST')")
    public ResponseEntity<AppointmentResponse> markNoShow(@PathVariable int id) {
        return ResponseEntity.ok(AppointmentResponse.fromEntity(service.markNoShow(id)));
    }

    /** PATCH /api/appointments/{id}/cancel — STUDENT (own), RECEPTIONIST (any) */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT','RECEPTIONIST','ADMIN')")
    public ResponseEntity<AppointmentResponse> cancel(
            @PathVariable int id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(AppointmentResponse.fromEntity(
                service.cancel(id, body.get("reason"), user)));
    }

    /** PATCH /api/appointments/{id}/status — kept for backward compat, delegates to advance or cancel */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','RECEPTIONIST','ADMIN','NURSE')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AppUserDetails user) {
        String status = body.get("status");
        if ("cancelled".equals(status)) {
            return ResponseEntity.ok(AppointmentResponse.fromEntity(
                    service.cancel(id, body.get("reason"), user)));
        }
        if ("no_show".equals(status)) {
            return ResponseEntity.ok(AppointmentResponse.fromEntity(service.markNoShow(id)));
        }
        return ResponseEntity.ok(AppointmentResponse.fromEntity(
                service.advanceStatus(id, status)));
    }
}
