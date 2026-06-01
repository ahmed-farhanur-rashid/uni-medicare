package com.uni.medicare.shared.repository;

import com.uni.medicare.shared.entity.DepartmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartmentScheduleRepository extends JpaRepository<DepartmentSchedule, Integer> {
    Optional<DepartmentSchedule> findByDepartment_DepartmentId(Integer departmentId);
}
