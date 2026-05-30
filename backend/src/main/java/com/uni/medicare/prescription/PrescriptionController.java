package com.uni.medicare.prescription;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.lab.PrescriptionLabTest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService service;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Prescription> create(
            @Valid @RequestBody CreatePrescriptionRequest req,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(service.create(req, user.getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','NURSE','STUDENT','ADMIN')")
    public ResponseEntity<Prescription> getById(
            @PathVariable int id,
            @AuthenticationPrincipal AppUserDetails user) {
        Prescription p = service.getById(id);
        // Students can only see their own prescriptions
        if ("student".equals(user.getType())) {
            int patientStudentId = p.getConsultation().getPatient().getStudent().getStudentId();
            if (patientStudentId != user.getId()) {
                return ResponseEntity.status(403).build();
            }
        }
        return ResponseEntity.ok(p);
    }

    @PostMapping("/{id}/medicines")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Prescription> addMedicine(
            @PathVariable int id,
            @Valid @RequestBody AddMedicineRequest req) {
        return ResponseEntity.ok(service.addMedicine(id, req));
    }

    @PostMapping("/{id}/lab-tests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionLabTest> addLabTest(
            @PathVariable int id,
            @RequestBody AddLabTestRequest req) {
        return ResponseEntity.ok(service.addLabTest(id, req));
    }
}
