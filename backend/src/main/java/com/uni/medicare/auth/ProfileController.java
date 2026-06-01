package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.auth.MedicalStaffRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class ProfileController {

    private final StudentRepository studentRepo;
    private final MedicalStaffRepository staffRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal AppUserDetails user) {
        if ("student".equals(user.getType())) {
            Student s = studentRepo.findByStudentId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Student not found"));
            return ResponseEntity.ok(Map.of(
                    "id", s.getStudentId(),
                    "name", s.getName(),
                    "email", s.getEmail() != null ? s.getEmail() : "",
                    "phone", s.getPhone() != null ? s.getPhone() : "",
                    "type", "student",
                    "role", "STUDENT",
                    "emailVerified", Boolean.TRUE.equals(s.getEmailVerified()),
                    "isActive", Boolean.TRUE.equals(s.getIsActive()),
                    "issuedOn", s.getIssuedOn() != null ? s.getIssuedOn().toString() : "",
                    "expiresOn", s.getExpiresOn() != null ? s.getExpiresOn().toString() : ""
            ));
        } else {
            MedicalStaff ms = staffRepo.findByMedicalStaffId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            return ResponseEntity.ok(Map.of(
                    "id", ms.getMedicalStaffId(),
                    "name", ms.getName(),
                    "email", ms.getEmail() != null ? ms.getEmail() : "",
                    "phone", ms.getPhone() != null ? ms.getPhone() : "",
                    "type", "staff",
                    "role", ms.getRole() != null ? ms.getRole().getRoleName() : "",
                    "specialty", ms.getSpecialty() != null ? ms.getSpecialty() : "",
                    "department", ms.getDepartment() != null ? ms.getDepartment().getName() : "",
                    "isActive", Boolean.TRUE.equals(ms.getIsActive())
            ));
        }
    }
}
