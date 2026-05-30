package com.uni.medicare.auth.passwordreset;

import com.uni.medicare.auth.MedicalStaffRepository;
import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository   tokenRepo;
    private final StudentRepository              studentRepo;
    private final MedicalStaffRepository         staffRepo;
    private final PasswordEncoder                passwordEncoder;

    @Value("${app.front-end-url:http://localhost:3000}")
    private String frontEndUrl;

    @Transactional
    public Optional<String> forgotPassword(String email) {
        Optional<Student> studentOpt = studentRepo.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            PasswordResetToken token = createToken("student", student.getStudentId());
            return Optional.of(token.getToken());
        }

        Optional<MedicalStaff> staffOpt = staffRepo.findByEmail(email);
        if (staffOpt.isPresent()) {
            MedicalStaff staff = staffOpt.get();
            PasswordResetToken token = createToken("staff", staff.getMedicalStaffId());
            return Optional.of(token.getToken());
        }

        return Optional.empty();
    }

    @Transactional
    public void resetPassword(String tokenValue, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Password must not be blank");
        }
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        PasswordResetToken token = tokenRepo.findByToken(tokenValue)
                .orElseThrow(() -> new EntityNotFoundException("Invalid reset token"));

        if (!token.isValid()) {
            throw new IllegalStateException("Reset token is expired or already used");
        }

        token.setUsedAt(LocalDateTime.now());
        tokenRepo.save(token);

        String encodedPassword = passwordEncoder.encode(newPassword);

        if ("student".equals(token.getUserType())) {
            Student student = studentRepo.findById(token.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("Student not found"));
            student.setPassword(encodedPassword);
            studentRepo.save(student);
        } else {
            MedicalStaff staff = staffRepo.findById(token.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("Staff not found"));
            staff.setPassword(encodedPassword);
            staffRepo.save(staff);
        }
    }

    public String getResetUrl(String token) {
        return frontEndUrl + "/reset-password?token=" + token;
    }

    private PasswordResetToken createToken(String userType, int userId) {
        PasswordResetToken token = new PasswordResetToken();
        token.setUserType(userType);
        token.setUserId(userId);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        return tokenRepo.save(token);
    }
}
