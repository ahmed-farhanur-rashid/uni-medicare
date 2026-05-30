package com.uni.medicare.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repo;

    /** Admin read-only — fetch logs with pagination */
    public Page<AuditLog> getAll(Pageable pageable) {
        return repo.findAll(pageable);
    }

    /**
     * Write an audit entry programmatically.
     * Called by Spring AOP advice for operations not covered by DB triggers.
     */
    public void log(String actorType, int actorId, String action,
                    String tableName, Integer recordId,
                    String oldValue, String newValue, String ipAddress) {
        AuditLog entry = new AuditLog();
        entry.setActorType(actorType);
        entry.setActorId(actorId);
        entry.setAction(action);
        entry.setTableName(tableName);
        entry.setRecordId(recordId);
        entry.setOldValue(oldValue);
        entry.setNewValue(newValue);
        entry.setIpAddress(ipAddress);
        repo.save(entry);
    }
}
