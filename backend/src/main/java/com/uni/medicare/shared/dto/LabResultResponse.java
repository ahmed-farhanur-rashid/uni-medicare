package com.uni.medicare.shared.dto;

import com.uni.medicare.lab.LabResult;
import java.time.LocalDateTime;

public record LabResultResponse(
        Integer resultId,
        Integer labTestId,
        String labTestName,
        Integer performedById,
        String performedByName,
        String resultValue,
        String resultNotes,
        String resultStatus,
        LocalDateTime resultedAt,
        Integer uploadId,
        LocalDateTime createdAt
) {
    public static LabResultResponse fromEntity(LabResult r) {
        return new LabResultResponse(
                r.getResultId(),
                r.getLabTest().getLabTestId(),
                r.getLabTest().getLabTestName(),
                r.getPerformedBy() != null ? r.getPerformedBy().getMedicalStaffId() : null,
                r.getPerformedBy() != null ? r.getPerformedBy().getName() : null,
                r.getResultValue(), r.getResultNotes(), r.getResultStatus(),
                r.getResultedAt(), r.getUploadId(), r.getCreatedAt()
        );
    }

    /** For student view — strips internal notes */
    public static LabResultResponse fromEntityForStudent(LabResult r) {
        return new LabResultResponse(
                r.getResultId(),
                r.getLabTest().getLabTestId(),
                r.getLabTest().getLabTestName(),
                null, null,
                r.getResultValue(), null, r.getResultStatus(),
                r.getResultedAt(), r.getUploadId(), r.getCreatedAt()
        );
    }
}
