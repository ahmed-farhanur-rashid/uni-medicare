package com.uni.medicare.admin;

import com.uni.medicare.shared.entity.Department;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

interface DepartmentRepository  extends JpaRepository<Department,     Integer> {
    java.util.Optional<Department> findByName(String name);
}
interface StaffRoleRepository   extends JpaRepository<MedicalStaffRole,Integer> {}
interface ScheduleRepository    extends JpaRepository<StaffSchedule,  Integer> {}
