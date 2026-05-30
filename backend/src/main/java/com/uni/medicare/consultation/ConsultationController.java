package com.uni.medicare.consultation;

import com.uni.medicare.auth.AppUserDetails;
import com.uni.medicare.shared.dto.ConsultationResponse;
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
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService service;
    private final PatientRepository   patientRepo;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','DOCTOR')")
    public List<ConsultationResponse> getMy(@AuthenticationPrincipal AppUserDetails user) {
        if ("student".equals(user.getType())) {
            Patient patient = patientRepo.findByStudent_StudentId(user.getId())
                    .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                            "No patient profile found for this student"));
            return service.getForPatient(patient.getPatientId())
                    .stream().map(ConsultationResponse::fromEntity).toList();
        }
        return service.getForDoctor(user.getId())
                .stream().map(ConsultationResponse::fromEntity).toList();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE','RECEPTIONIST')")
    public ResponseEntity<ConsultationResponse> open(@Valid @RequestBody OpenConsultationRequest req) {
        return ResponseEntity.ok(ConsultationResponse.fromEntity(service.open(req)));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ConsultationResponse> addNotes(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ConsultationResponse.fromEntity(service.addNotes(id, body.get("notes"))));
    }
}
