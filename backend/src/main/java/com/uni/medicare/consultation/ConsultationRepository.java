package com.uni.medicare.consultation;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {
    List<Consultation> findByPatient_PatientId(Integer patientId);
    List<Consultation> findByMedicalStaff_MedicalStaffId(Integer staffId);
}
