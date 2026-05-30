package com.uni.medicare.audit;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repo;

    /** Admin read-only — fetch all logs */
    public List<AuditLog> getAll() {
        return repo.findAll();
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
