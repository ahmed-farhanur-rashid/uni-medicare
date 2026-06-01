package com.uni.medicare.auth;

import com.uni.medicare.auth.emailverification.EmailVerificationService;
import com.uni.medicare.shared.email.EmailService;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.AccountRepository;
import com.uni.medicare.shared.repository.PatientRepository;
import com.uni.medicare.shared.util.JwtUtil;
import jakarta.persistence.EntityExistsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private StudentRepository studentRepo;
    @Mock private MedicalStaffRepository staffRepo;
    @Mock private AccountRepository accountRepo;
    @Mock private PatientRepository patientRepo;
    @Mock private JwtUtil jwtUtil;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailVerificationService emailVerificationService;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    // ─── helpers ────────────────────────────────────────────────

    private MedicalStaff buildStaff(int id, boolean active) {
        MedicalStaffRole role = new MedicalStaffRole();
        role.setRoleId(1);
        role.setRoleName("DOCTOR");

        MedicalStaff staff = new MedicalStaff();
        staff.setMedicalStaffId(id);
        staff.setName("Dr. Smith");
        staff.setEmail("smith@uni.edu");
        staff.setPassword("hashed");
        staff.setIsActive(active);
        staff.setRole(role);
        return staff;
    }

    private Student buildStudent(int id, boolean active, LocalDate expiresOn, boolean emailVerified) {
        Student s = new Student();
        s.setStudentId(id);
        s.setName("John");
        s.setEmail("john@uni.edu");
        s.setPassword("hashed");
        s.setIsActive(active);
        s.setExpiresOn(expiresOn);
        s.setEmailVerified(emailVerified);
        return s;
    }

    // ─── staff login tests ──────────────────────────────────────

    @Test
    void login_staff_success() {
        MedicalStaff staff = buildStaff(100, true);
        when(staffRepo.findByMedicalStaffId(100)).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(100, "DOCTOR", "staff")).thenReturn("jwt-token");

        LoginResponse resp = authService.login(new LoginRequest("100", "pass123"));

        assertThat(resp.token()).isEqualTo("jwt-token");
        assertThat(resp.id()).isEqualTo(100);
        assertThat(resp.role()).isEqualTo("DOCTOR");
        assertThat(resp.type()).isEqualTo("staff");
    }

    @Test
    void login_staff_invalid_password() {
        MedicalStaff staff = buildStaff(100, true);
        when(staffRepo.findByMedicalStaffId(100)).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("100", "wrong")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_staff_inactive() {
        MedicalStaff staff = buildStaff(100, false);
        when(staffRepo.findByMedicalStaffId(100)).thenReturn(Optional.of(staff));

        assertThatThrownBy(() -> authService.login(new LoginRequest("100", "pass")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("deactivated");
    }

    // ─── student login tests ────────────────────────────────────

    @Test
    void login_student_success() {
        Student student = buildStudent(200, true, LocalDate.now().plusMonths(6), true);
        when(staffRepo.findByMedicalStaffId(200)).thenReturn(Optional.empty());
        when(studentRepo.findByStudentId(200)).thenReturn(Optional.of(student));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(200, "STUDENT", "student")).thenReturn("student-jwt");

        LoginResponse resp = authService.login(new LoginRequest("200", "pass123"));

        assertThat(resp.token()).isEqualTo("student-jwt");
        assertThat(resp.id()).isEqualTo(200);
        assertThat(resp.role()).isEqualTo("STUDENT");
        assertThat(resp.type()).isEqualTo("student");
    }

    @Test
    void login_student_not_verified() {
        Student student = buildStudent(200, true, LocalDate.now().plusMonths(6), false);
        when(staffRepo.findByMedicalStaffId(200)).thenReturn(Optional.empty());
        when(studentRepo.findByStudentId(200)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> authService.login(new LoginRequest("200", "pass")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("verify your email");
    }

    @Test
    void login_student_expired() {
        Student student = buildStudent(200, true, LocalDate.now().minusDays(1), true);
        when(staffRepo.findByMedicalStaffId(200)).thenReturn(Optional.empty());
        when(studentRepo.findByStudentId(200)).thenReturn(Optional.of(student));

        assertThatThrownBy(() -> authService.login(new LoginRequest("200", "pass")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void login_student_invalid_password() {
        Student student = buildStudent(200, true, LocalDate.now().plusMonths(6), true);
        when(staffRepo.findByMedicalStaffId(200)).thenReturn(Optional.empty());
        when(studentRepo.findByStudentId(200)).thenReturn(Optional.of(student));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("200", "wrong")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_not_found() {
        when(staffRepo.findByMedicalStaffId(999)).thenReturn(Optional.empty());
        when(studentRepo.findByStudentId(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("999", "pass")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid credentials");
    }

    @Test
    void login_staff_by_email() {
        MedicalStaff staff = buildStaff(100, true);
        when(staffRepo.findByEmail("smith@uni.edu")).thenReturn(Optional.of(staff));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(100, "DOCTOR", "staff")).thenReturn("jwt-token");

        LoginResponse resp = authService.login(new LoginRequest("smith@uni.edu", "pass123"));

        assertThat(resp.token()).isEqualTo("jwt-token");
        assertThat(resp.type()).isEqualTo("staff");
    }

    @Test
    void login_student_by_email() {
        Student student = buildStudent(200, true, LocalDate.now().plusMonths(6), true);
        when(staffRepo.findByEmail("john@uni.edu")).thenReturn(Optional.empty());
        when(studentRepo.findByEmail("john@uni.edu")).thenReturn(Optional.of(student));
        when(passwordEncoder.matches("pass123", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(200, "STUDENT", "student")).thenReturn("student-jwt");

        LoginResponse resp = authService.login(new LoginRequest("john@uni.edu", "pass123"));

        assertThat(resp.token()).isEqualTo("student-jwt");
        assertThat(resp.type()).isEqualTo("student");
    }

    // ─── register tests ─────────────────────────────────────────

    @Test
    void register_success() {
        when(studentRepo.findByStudentId(300)).thenReturn(Optional.empty());
        when(accountRepo.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            a.setAccountId(1);
            return a;
        });
        when(studentRepo.save(any(Student.class))).thenAnswer(inv -> inv.getArgument(0));
        when(patientRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(emailVerificationService.generateToken(300)).thenReturn("verify-token-abc");

        RegisterRequest req = new RegisterRequest(
                300, "Alice", "alice@uni.edu", "1234567890",
                "password123", LocalDate.of(2000, 1, 1), "A+", "F"
        );

        String token = authService.register(req);

        assertThat(token).isEqualTo("verify-token-abc");
        verify(accountRepo).save(any(Account.class));
        verify(studentRepo).save(any(Student.class));
        verify(patientRepo).save(any());
        verify(emailVerificationService).generateToken(300);
    }

    @Test
    void register_duplicate_id() {
        when(studentRepo.findByStudentId(300)).thenReturn(Optional.of(new Student()));

        RegisterRequest req = new RegisterRequest(
                300, "Alice", "alice@uni.edu", "1234567890",
                "password123", LocalDate.of(2000, 1, 1), "A+", "F"
        );

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(EntityExistsException.class)
                .hasMessageContaining("already registered");
    }
}
