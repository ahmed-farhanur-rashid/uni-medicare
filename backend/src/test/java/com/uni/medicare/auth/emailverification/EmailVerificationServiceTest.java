package com.uni.medicare.auth.emailverification;

import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock private EmailVerificationTokenRepository tokenRepo;
    @Mock private StudentRepository studentRepo;

    @InjectMocks private EmailVerificationService emailVerificationService;

    @Test
    void generateToken_success() {
        Student student = new Student();
        student.setStudentId(1);
        student.setEmail("alice@uni.edu");

        when(studentRepo.findById(1)).thenReturn(Optional.of(student));
        when(tokenRepo.save(any(EmailVerificationToken.class))).thenAnswer(inv -> {
            EmailVerificationToken t = inv.getArgument(0);
            t.setTokenId(1);
            return t;
        });

        String token = emailVerificationService.generateToken(1);

        assertThat(token).isNotBlank();
        verify(tokenRepo).save(any(EmailVerificationToken.class));
        verify(studentRepo).findById(1);
    }

    @Test
    void generateToken_student_not_found() {
        when(studentRepo.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.generateToken(999))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Student not found");
    }

    @Test
    void verifyEmail_success() {
        Student student = new Student();
        student.setStudentId(1);
        student.setEmailVerified(false);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken("valid-token");
        token.setStudent(student);
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsedAt(null);

        when(tokenRepo.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(tokenRepo.save(any(EmailVerificationToken.class))).thenAnswer(inv -> inv.getArgument(0));
        when(studentRepo.save(any(Student.class))).thenAnswer(inv -> inv.getArgument(0));

        emailVerificationService.verifyEmail("valid-token");

        assertThat(token.getUsedAt()).isNotNull();
        assertThat(student.getEmailVerified()).isTrue();
        verify(tokenRepo).save(token);
        verify(studentRepo).save(student);
    }

    @Test
    void verifyEmail_invalid_token() {
        when(tokenRepo.findByToken("bad-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> emailVerificationService.verifyEmail("bad-token"))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Invalid verification token");
    }

    @Test
    void verifyEmail_expired_token() {
        Student student = new Student();
        student.setStudentId(1);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken("expired-token");
        token.setStudent(student);
        token.setExpiresAt(LocalDateTime.now().minusHours(1));
        token.setUsedAt(null);

        when(tokenRepo.findByToken("expired-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> emailVerificationService.verifyEmail("expired-token"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired or already used");
    }

    @Test
    void verifyEmail_used_token() {
        Student student = new Student();
        student.setStudentId(1);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setToken("used-token");
        token.setStudent(student);
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsedAt(LocalDateTime.now().minusHours(1));

        when(tokenRepo.findByToken("used-token")).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> emailVerificationService.verifyEmail("used-token"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired or already used");
    }
}
