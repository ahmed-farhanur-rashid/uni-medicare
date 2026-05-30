package com.uni.medicare.shared.dto;

import com.uni.medicare.prescription.Prescription;
import com.uni.medicare.lab.PrescriptionLabTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PrescriptionResponse(
        Integer prescriptionId,
        Integer consultId,
        LocalDateTime prescriptionDate,
        String chiefComplaint,
        String diagnosis,
        LocalDate followUpDate,
        List<LabTestItem> labTests
) {
    public record LabTestItem(
            Integer labTestId, String labTestName, Integer catalogId
    ) {
        public static LabTestItem from(PrescriptionLabTest lt) {
            return new LabTestItem(lt.getLabTestId(), lt.getLabTestName(),
                    lt.getCatalog() != null ? lt.getCatalog().getCatalogId() : null);
        }
    }

    public static PrescriptionResponse fromEntity(Prescription p) {
        return fromEntity(p, List.of());
    }

    public static PrescriptionResponse fromEntity(Prescription p, List<PrescriptionLabTest> labTests) {
        List<LabTestItem> tests = labTests != null
                ? labTests.stream().map(LabTestItem::from).toList()
                : List.of();
        return new PrescriptionResponse(
                p.getPrescriptionId(), p.getConsultation().getConsultId(),
                p.getPrescriptionDate(), p.getChiefComplaint(), p.getDiagnosis(),
                p.getFollowUpDate(), tests
        );
    }
}
