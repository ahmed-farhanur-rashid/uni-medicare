package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.auth.MedicalStaffRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final StudentRepository studentRepo;
    private final MedicalStaffRepository staffRepo;
    private final PasswordEncoder passwordEncoder;

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

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(
            @AuthenticationPrincipal AppUserDetails user,
            @RequestBody Map<String, String> updates) {
        
        if ("student".equals(user.getType())) {
            Student s = studentRepo.findByStudentId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Student not found"));
            
            if (updates.containsKey("name")) s.setName(updates.get("name"));
            if (updates.containsKey("phone")) s.setPhone(updates.get("phone"));
            if (updates.containsKey("email")) s.setEmail(updates.get("email"));
            
            studentRepo.save(s);
            log.info("Student {} profile updated", s.getStudentId());
            
            return ResponseEntity.ok(Map.of(
                    "id", s.getStudentId(),
                    "name", s.getName(),
                    "email", s.getEmail() != null ? s.getEmail() : "",
                    "phone", s.getPhone() != null ? s.getPhone() : "",
                    "message", "Profile updated successfully"
            ));
        } else {
            MedicalStaff ms = staffRepo.findByMedicalStaffId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            
            if (updates.containsKey("name")) ms.setName(updates.get("name"));
            if (updates.containsKey("phone")) ms.setPhone(updates.get("phone"));
            // Specialty is admin-only — not editable via profile
            
            staffRepo.save(ms);
            log.info("Staff {} profile updated", ms.getMedicalStaffId());
            
            return ResponseEntity.ok(Map.of(
                    "id", ms.getMedicalStaffId(),
                    "name", ms.getName(),
                    "email", ms.getEmail() != null ? ms.getEmail() : "",
                    "phone", ms.getPhone() != null ? ms.getPhone() : "",
                    "specialty", ms.getSpecialty() != null ? ms.getSpecialty() : "",
                    "message", "Profile updated successfully"
            ));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal AppUserDetails user,
            @RequestBody Map<String, String> body) {
        
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current and new password required"));
        }
        
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters"));
        }
        
        if ("student".equals(user.getType())) {
            Student s = studentRepo.findByStudentId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Student not found"));
            
            if (!passwordEncoder.matches(currentPassword, s.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            
            s.setPassword(passwordEncoder.encode(newPassword));
            studentRepo.save(s);
            log.info("Student {} password changed", s.getStudentId());
        } else {
            MedicalStaff ms = staffRepo.findByMedicalStaffId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            
            if (!passwordEncoder.matches(currentPassword, ms.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            
            ms.setPassword(passwordEncoder.encode(newPassword));
            staffRepo.save(ms);
            log.info("Staff {} password changed", ms.getMedicalStaffId());
        }
        
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
