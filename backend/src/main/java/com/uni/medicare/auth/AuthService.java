package com.uni.medicare.auth;

import com.uni.medicare.auth.emailverification.EmailVerificationService;
import com.uni.medicare.shared.email.EmailService;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.AccountRepository;
import com.uni.medicare.shared.repository.PatientRepository;
import com.uni.medicare.shared.util.JwtUtil;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository      studentRepo;
    private final MedicalStaffRepository staffRepo;
    private final AccountRepository      accountRepo;
    private final PatientRepository      patientRepo;
    private final JwtUtil                jwtUtil;
    private final PasswordEncoder        passwordEncoder;
    private final EmailVerificationService emailVerificationService;
    private final EmailService             emailService;

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

    @Transactional
    public String register(RegisterRequest req) {
        // Check student ID not already taken
        if (studentRepo.findByStudentId(req.studentId()).isPresent()) {
            throw new EntityExistsException("Student ID already registered");
        }

        // Create bank account
        Account account = accountRepo.save(new Account());

        // Create student
        Student student = new Student();
        student.setStudentId(req.studentId());
        student.setName(req.name());
        student.setEmail(req.email());
        student.setPhone(req.phone());
        student.setPassword(passwordEncoder.encode(req.password()));
        student.setIssuedOn(LocalDate.now());
        student.setIsActive(true);
        student.setEmailVerified(false);
        student.setAccount(account);
        student = studentRepo.save(student);

        // Create patient profile
        Patient patient = new Patient();
        patient.setStudent(student);
        patient.setDateOfBirth(req.dateOfBirth());
        patient.setBloodgroup(req.bloodgroup());
        patient.setSex(req.sex());
        patientRepo.save(patient);

        // Generate email verification token and return it
        return emailVerificationService.generateToken(student.getStudentId());
    }

    /** Resend verification email for the given email address. */
    public void resendVerification(String email) {
        var student = studentRepo.findByEmail(email)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("No account found with that email"));
        if (Boolean.TRUE.equals(student.getEmailVerified())) {
            return; // already verified, silently succeed
        }
        String token = emailVerificationService.generateToken(student.getStudentId());
        String url = emailVerificationService.getVerificationUrl(token);
        emailService.sendVerificationEmail(email, url);
    }
}
