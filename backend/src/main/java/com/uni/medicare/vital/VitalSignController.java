package com.uni.medicare.vital;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vitals")
@RequiredArgsConstructor
public class VitalSignController {

    private final VitalSignService service;

    @PostMapping("/{consultId}")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<VitalSign> record(
            @PathVariable int consultId,
            @RequestBody RecordVitalsRequest req) {
        return ResponseEntity.ok(service.record(consultId, req));
    }

    @GetMapping("/{consultId}")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public ResponseEntity<VitalSign> get(@PathVariable int consultId) {
        return ResponseEntity.ok(service.get(consultId));
    }
}
