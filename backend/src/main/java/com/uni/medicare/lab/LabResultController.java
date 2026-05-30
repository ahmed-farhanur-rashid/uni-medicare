package com.uni.medicare.lab;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.dto.LabResultResponse;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService   service;
    private final PatientRepository  patientRepo;

    @GetMapping("/prescription/{prescriptionId}")
    @PreAuthorize("hasAnyRole('DOCTOR','LAB_TECHNICIAN')")
    public List<LabResultResponse> getByPrescription(@PathVariable int prescriptionId) {
        return service.getByPrescription(prescriptionId)
                .stream().map(LabResultResponse::fromEntity).toList();
    }

    @PatchMapping("/{resultId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LabResultResponse> update(
            @PathVariable int resultId,
            @RequestBody UpdateLabResultRequest req,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(LabResultResponse.fromEntity(service.update(resultId, req, user.getId())));
    }

    /** STUDENT — own results only, no internal notes */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<LabResultResponse> getMyResults(@AuthenticationPrincipal AppUserDetails user) {
        Patient patient = patientRepo.findByStudent_StudentId(user.getId())
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "No patient profile found for this student"));
        return service.getForPatient(patient.getPatientId())
                .stream().map(LabResultResponse::fromEntityForStudent).toList();
    }
}
