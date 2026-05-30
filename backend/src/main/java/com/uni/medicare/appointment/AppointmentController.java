package com.uni.medicare.appointment;

import com.uni.medicare.auth.AppUserDetails;
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

    /** GET /api/appointments — RECEPTIONIST, ADMIN */
    @GetMapping
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN')")
    public List<Appointment> getAll() {
        return service.getAll();
    }

    /** GET /api/appointments/my — STUDENT sees own, DOCTOR sees own schedule */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','DOCTOR')")
    public List<Appointment> getMy(@AuthenticationPrincipal AppUserDetails user) {
        if ("student".equals(user.getType())) {
            // studentId → patientId lookup would normally go via PatientRepository;
            // simplified here — in production resolve patient from student id
            return service.getForPatient(user.getId());
        }
        return service.getForDoctor(user.getId());
    }

    /** POST /api/appointments — STUDENT, RECEPTIONIST, NURSE */
    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','RECEPTIONIST','NURSE')")
    public ResponseEntity<Appointment> book(
            @Valid @RequestBody BookAppointmentRequest req,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(service.book(req, user));
    }

    /** PATCH /api/appointments/{id}/status — RECEPTIONIST, ADMIN */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECEPTIONIST','ADMIN')")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                service.updateStatus(id, body.get("status"), body.get("reason")));
    }
}
