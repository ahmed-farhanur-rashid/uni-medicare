package com.uni.medicare.auth.emailverification;

import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepo;
    private final StudentRepository                studentRepo;

    @Value("${app.front-end-url:http://localhost:3000}")
    private String frontEndUrl;

    @Transactional
    public String generateToken(int studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        EmailVerificationToken token = new EmailVerificationToken();
        token.setStudent(student);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusHours(24));
        tokenRepo.save(token);

        return token.getToken();
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = tokenRepo.findByToken(tokenValue)
                .orElseThrow(() -> new EntityNotFoundException("Invalid verification token"));

        if (!token.isValid()) {
            throw new IllegalStateException("Verification token is expired or already used");
        }

        token.setUsedAt(LocalDateTime.now());
        tokenRepo.save(token);

        Student student = token.getStudent();
        student.setEmailVerified(true);
        studentRepo.save(student);
    }

    public String getVerificationUrl(String token) {
        return frontEndUrl + "/verify-email?token=" + token;
    }
}
