package com.uni.medicare.shared.repository;

import com.uni.medicare.shared.entity.History;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoryRepository extends JpaRepository<History, Integer> {
    List<History> findByPatient_PatientId(Integer patientId);
}
