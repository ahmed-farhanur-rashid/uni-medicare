package com.uni.medicare.lab;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LabResultRepository extends JpaRepository<LabResult, Integer> {
    List<LabResult> findByLabTest_Prescription_PrescriptionId(Integer prescriptionId);
    List<LabResult> findByLabTest_Prescription_Consultation_Patient_PatientId(Integer patientId);
    Optional<LabResult> findByLabTest_LabTestId(Integer labTestId);
}
