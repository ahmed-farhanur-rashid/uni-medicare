package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository      studentRepo;
    private final MedicalStaffRepository staffRepo;
    private final JwtUtil                jwtUtil;
    private final PasswordEncoder        passwordEncoder;

    /**
     * Attempt login with eID + password.
     * Strategy: try staff first (they have a password column),
     * then try student.
     */
    public LoginResponse login(LoginRequest req) {

        // ── Try staff ────────────────────────────────────────────────
        var staffOpt = staffRepo.findByMedicalStaffId(req.eId());
        if (staffOpt.isPresent()) {
            MedicalStaff staff = staffOpt.get();

            if (!staff.getIsActive()) {
                throw new IllegalStateException("Staff account is deactivated");
            }
            if (!passwordEncoder.matches(req.password(), staff.getPassword())) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            String role  = staff.getRole().getRoleName().toUpperCase(); // e.g. "DOCTOR"
            String token = jwtUtil.generateToken(staff.getMedicalStaffId(), role, "staff");
            return new LoginResponse(token, staff.getMedicalStaffId(), role, "staff");
        }

        // ── Try student ──────────────────────────────────────────────
        var studentOpt = studentRepo.findByStudentId(req.eId());
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();

            if (!student.getIsActive()) {
                throw new IllegalStateException("Student account is inactive");
            }
            if (student.getExpiresOn() == null || student.getExpiresOn().isBefore(LocalDate.now())) {
                throw new IllegalStateException("Student enrollment has expired");
            }
            if (!Boolean.TRUE.equals(student.getEmailVerified())) {
                throw new IllegalStateException("Please verify your email before logging in");
            }
            if (!passwordEncoder.matches(req.password(), student.getPassword())) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            String token = jwtUtil.generateToken(student.getStudentId(), "STUDENT", "student");
            return new LoginResponse(token, student.getStudentId(), "STUDENT", "student");
        }

        throw new IllegalArgumentException("Invalid credentials");
    }
}
