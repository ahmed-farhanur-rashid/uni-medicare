package com.uni.medicare.shared.dto;

import com.uni.medicare.shared.entity.Student;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Student response — excludes password hash */
public record StudentResponse(
        Integer studentId,
        String name,
        String email,
        String phone,
        LocalDate issuedOn,
        LocalDate expiresOn,
        Boolean isActive,
        Boolean emailVerified,
        Integer accountId,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static StudentResponse fromEntity(Student s) {
        return new StudentResponse(
                s.getStudentId(), s.getName(), s.getEmail(), s.getPhone(),
                s.getIssuedOn(), s.getExpiresOn(), s.getIsActive(), s.getEmailVerified(),
                s.getAccount() != null ? s.getAccount().getAccountId() : null,
                s.getCreatedAt(), s.getUpdatedAt()
        );
    }
}
