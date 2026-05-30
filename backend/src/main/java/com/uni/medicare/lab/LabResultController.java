package com.uni.medicare.lab;

import com.uni.medicare.auth.AppUserDetails;
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

    private final LabResultService service;

    @GetMapping("/prescription/{prescriptionId}")
    @PreAuthorize("hasAnyRole('DOCTOR','LAB_TECHNICIAN')")
    public List<LabResult> getByPrescription(@PathVariable int prescriptionId) {
        return service.getByPrescription(prescriptionId);
    }

    @PatchMapping("/{resultId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LabResult> update(
            @PathVariable int resultId,
            @RequestBody UpdateLabResultRequest req,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(service.update(resultId, req, user.getId()));
    }

    /** STUDENT — own results only, no internal notes */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<LabResult> getMyResults(@AuthenticationPrincipal AppUserDetails user) {
        List<LabResult> results = service.getForPatient(user.getId());
        // Null out internal notes before returning to student
        results.forEach(r -> r.setResultNotes(null));
        return results;
    }
}
