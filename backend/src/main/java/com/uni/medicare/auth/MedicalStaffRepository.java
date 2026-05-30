package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.MedicalStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MedicalStaffRepository extends JpaRepository<MedicalStaff, Integer> {
    Optional<MedicalStaff> findByMedicalStaffId(Integer staffId);
}
