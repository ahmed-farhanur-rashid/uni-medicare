package com.uni.medicare.shared.dto;

import com.uni.medicare.shared.entity.MedicalStaff;

public record DoctorResponse(
        Integer id,
        String name,
        String specialty,
        String department,
        String email,
        String phone
) {
    public static DoctorResponse fromEntity(MedicalStaff s) {
        return new DoctorResponse(
                s.getMedicalStaffId(),
                s.getName(),
                s.getSpecialty(),
                s.getDepartment() != null ? s.getDepartment().getName() : null,
                s.getEmail(),
                s.getPhone()
        );
    }
}
