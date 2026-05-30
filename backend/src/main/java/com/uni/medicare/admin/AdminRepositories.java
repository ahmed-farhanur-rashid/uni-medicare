package com.uni.medicare.admin;

import com.uni.medicare.shared.entity.Department;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.StaffSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

interface DepartmentRepository  extends JpaRepository<Department,     Integer> {}
interface StaffRoleRepository   extends JpaRepository<MedicalStaffRole,Integer> {}
public interface StaffAdminRepository  extends JpaRepository<MedicalStaff,   Integer> {}
interface ScheduleRepository    extends JpaRepository<StaffSchedule,  Integer> {}
