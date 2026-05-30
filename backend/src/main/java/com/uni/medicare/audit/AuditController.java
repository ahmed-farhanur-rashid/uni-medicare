package com.uni.medicare.audit;

import com.uni.medicare.shared.dto.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService service;

    /** GET /api/audit-logs — ADMIN only, paginated */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Page<AuditLogResponse> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return service.getAll(pageable).map(AuditLogResponse::fromEntity);
    }
}
