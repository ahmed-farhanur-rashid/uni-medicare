package com.uni.medicare.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.AccountRepository;
import com.uni.medicare.shared.util.JwtUtil;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EntityManager em;
    @Autowired private AccountRepository accountRepo;
    @Autowired private MedicalStaffRepository staffRepo;
    @Autowired private StudentRepository studentRepo;

    private MedicalStaff testStaff;
    private Student testStudent;

    @BeforeEach
    void setUp() {
        // ── MedicalStaffRole (no public repo — persist via EntityManager) ──
        MedicalStaffRole role = new MedicalStaffRole();
        role.setRoleId(1);
        role.setRoleName("DOCTOR");
        role.setCanPrescribe(true);
        em.persist(role);

        // ── MedicalStaff ──
        testStaff = new MedicalStaff();
        testStaff.setMedicalStaffId(100);
        testStaff.setName("Dr. Smith");
        testStaff.setEmail("smith@uni.edu");
        testStaff.setPassword(passwordEncoder.encode("staff123"));
        testStaff.setIsActive(true);
        testStaff.setRole(role);
        staffRepo.save(testStaff);

        // ── Student ──
        Account account = accountRepo.save(new Account());

        testStudent = new Student();
        testStudent.setStudentId(200);
        testStudent.setName("John Doe");
        testStudent.setEmail("john@uni.edu");
        testStudent.setPhone("01712345678");
        testStudent.setPassword(passwordEncoder.encode("student123"));
        testStudent.setIssuedOn(LocalDate.now());
        testStudent.setIsActive(true);
        testStudent.setEmailVerified(true);
        testStudent.setAccount(account);
        studentRepo.save(testStudent);

        // Set expiresOn via native query (column is insertable=false, updatable=false)
        em.createNativeQuery("UPDATE students SET expires_on = :expires WHERE student_id = :id")
                .setParameter("expires", LocalDate.now().plusYears(1))
                .setParameter("id", 200)
                .executeUpdate();
        em.flush();
    }

    // ─── login ──────────────────────────────────────────────────

    @Test
    void login_success() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("eId", "100", "password", "staff123"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.role").value("DOCTOR"))
                .andExpect(jsonPath("$.type").value("staff"));
    }

    @Test
    void login_invalid_credentials() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("eId", "100", "password", "wrongpassword"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    // ─── register ───────────────────────────────────────────────

    @Test
    void register_success() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "studentId", 999,
                "name", "Alice",
                "email", "alice@uni.edu",
                "phone", "01912345678",
                "password", "password123",
                "dateOfBirth", "2000-06-15",
                "bloodgroup", "A+",
                "sex", "F"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.verificationUrl").exists());
    }

    @Test
    void register_duplicate_id() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "studentId", 200,
                "name", "Duplicate",
                "email", "dup@uni.edu",
                "phone", "01912345678",
                "password", "password123",
                "dateOfBirth", "2000-06-15",
                "bloodgroup", "O+",
                "sex", "M"
        ));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Student ID already registered"));
    }

    // ─── email verification ─────────────────────────────────────

    @Test
    void verify_email_invalid_token() throws Exception {
        mockMvc.perform(get("/api/auth/verify-email")
                        .param("token", "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    // ─── forgot password ────────────────────────────────────────

    @Test
    void forgot_password() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("email", "john@uni.edu"));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "If the email exists, a reset link has been sent"));
    }

    @Test
    void forgot_password_nonexistent_email_also_returns_200() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("email", "nobody@uni.edu"));

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "If the email exists, a reset link has been sent"));
    }

    // ─── resend verification ────────────────────────────────────

    @Test
    void resend_verification_no_email() throws Exception {
        String body = objectMapper.writeValueAsString(
                Map.of("email", "nonexistent@uni.edu"));

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(
                        "If the email exists, a verification link has been sent"));
    }

    // ─── protected endpoints ────────────────────────────────────

    @Test
    void protected_endpoint_without_token() throws Exception {
        mockMvc.perform(get("/api/appointments"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protected_endpoint_with_token() throws Exception {
        String token = jwtUtil.generateToken(200, "STUDENT", "student");

        mockMvc.perform(get("/api/appointments/my")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
