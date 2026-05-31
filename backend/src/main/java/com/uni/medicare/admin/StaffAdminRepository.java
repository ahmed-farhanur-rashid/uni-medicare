package com.uni.medicare.admin;

import com.uni.medicare.shared.entity.MedicalStaff;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffAdminRepository extends JpaRepository<MedicalStaff, Integer> {}
