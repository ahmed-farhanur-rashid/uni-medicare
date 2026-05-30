package com.uni.medicare.lab;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionLabTestRepository extends JpaRepository<PrescriptionLabTest, Integer> {
    List<PrescriptionLabTest> findByPrescription_PrescriptionId(Integer prescriptionId);
}
