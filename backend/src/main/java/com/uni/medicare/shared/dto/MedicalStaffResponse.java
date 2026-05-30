package com.uni.medicare.shared.dto;

import com.uni.medicare.shared.entity.MedicalStaff;
import java.time.LocalDateTime;

/** Medical staff response — excludes password hash */
public record MedicalStaffResponse(
        Integer medicalStaffId,
        String roleName,
        Boolean canPrescribe,
        String departmentName,
        String name,
        String email,
        String phone,
        String specialty,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static MedicalStaffResponse fromEntity(MedicalStaff s) {
        return new MedicalStaffResponse(
                s.getMedicalStaffId(),
                s.getRole() != null ? s.getRole().getRoleName() : null,
                s.getRole() != null ? s.getRole().getCanPrescribe() : null,
                s.getDepartment() != null ? s.getDepartment().getName() : null,
                s.getName(), s.getEmail(), s.getPhone(), s.getSpecialty(),
                s.getIsActive(), s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
