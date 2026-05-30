package com.uni.medicare.shared.dto;

import com.uni.medicare.audit.AuditLog;
import java.time.LocalDateTime;

public record AuditLogResponse(
        Integer logId,
        String actorType,
        Integer actorId,
        String action,
        String tableName,
        Integer recordId,
        String oldValue,
        String newValue,
        String ipAddress,
        LocalDateTime createdAt
) {
    public static AuditLogResponse fromEntity(AuditLog log) {
        return new AuditLogResponse(
                log.getLogId(), log.getActorType(), log.getActorId(),
                log.getAction(), log.getTableName(), log.getRecordId(),
                log.getOldValue(), log.getNewValue(), log.getIpAddress(),
                log.getCreatedAt()
        );
    }
}
