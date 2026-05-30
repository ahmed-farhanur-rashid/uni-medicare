package com.uni.medicare.consultation;

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
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService service;

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('STUDENT','DOCTOR')")
    public List<Consultation> getMy(@AuthenticationPrincipal AppUserDetails user) {
        if ("student".equals(user.getType()))
            return service.getForPatient(user.getId());
        return service.getForDoctor(user.getId());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('NURSE','RECEPTIONIST')")
    public ResponseEntity<Consultation> open(@Valid @RequestBody OpenConsultationRequest req) {
        return ResponseEntity.ok(service.open(req));
    }

    @PatchMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Consultation> addNotes(
            @PathVariable int id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.addNotes(id, body.get("notes")));
    }
}
