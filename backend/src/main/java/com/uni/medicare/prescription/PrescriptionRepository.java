package com.uni.medicare.prescription;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByConsultation_Patient_PatientId(Integer patientId);
}
