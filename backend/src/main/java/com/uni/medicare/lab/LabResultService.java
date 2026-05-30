package com.uni.medicare.lab;

import com.uni.medicare.shared.entity.MedicalStaff;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LabResultService {

    private final LabResultRepository repo;
    private final EntityManager       em;

    public List<LabResult> getByPrescription(int prescriptionId) {
        return repo.findByLabTest_Prescription_PrescriptionId(prescriptionId);
    }

    public List<LabResult> getForPatient(int patientId) {
        return repo.findByLabTest_Prescription_Consultation_Patient_PatientId(patientId);
    }

    /**
     * Lab technician updates result fields only.
     * Rule 6: result can only be updated when status is pending or in_progress.
     */
    @Transactional
    public LabResult update(int resultId, UpdateLabResultRequest req, int staffId) {
        LabResult r = repo.findById(resultId)
                .orElseThrow(() -> new EntityNotFoundException("Lab result not found"));

        if (!"pending".equals(r.getResultStatus()) && !"in_progress".equals(r.getResultStatus())) {
            throw new IllegalStateException(
                    "Result cannot be updated in status: " + r.getResultStatus());
        }

        r.setResultValue(req.resultValue());
        r.setResultNotes(req.resultNotes());
        r.setResultStatus(req.resultStatus());
        r.setResultedAt(LocalDateTime.now());
        r.setPerformedBy(em.getReference(MedicalStaff.class, staffId));

        return repo.save(r);
    }
}
