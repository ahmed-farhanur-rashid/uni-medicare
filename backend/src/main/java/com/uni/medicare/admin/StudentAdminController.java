package com.uni.medicare.admin;

import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.shared.dto.StudentResponse;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.AccountRepository;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StudentAdminController {

    private final StudentRepository    studentRepo;
    private final PatientRepository    patientRepo;
    private final AccountRepository    accountRepo;
    private final PasswordEncoder      passwordEncoder;

    @GetMapping
    public Page<StudentResponse> all(Pageable pageable) {
        return studentRepo.findAll(pageable).map(StudentResponse::fromEntity);
    }

    @GetMapping("/{id}")
    public StudentResponse one(@PathVariable int id) {
        return StudentResponse.fromEntity(studentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found")));
    }

    @PostMapping
    @Transactional
    public StudentResponse create(@RequestBody CreateStudentRequest req) {
        // 1. Create a bank account for the student
        Account account = new Account();
        account = accountRepo.save(account);

        // 2. Create the student with the new account
        Student student = new Student();
        student.setStudentId(req.studentId());
        student.setName(req.name());
        student.setEmail(req.email());
        student.setPhone(req.phone());
        student.setPassword(passwordEncoder.encode(req.password()));
        student.setIssuedOn(req.issuedOn() != null ? req.issuedOn() : LocalDate.now());
        student.setIsActive(true);
        student.setEmailVerified(false);
        student.setAccount(account);
        Student saved = studentRepo.save(student);

        // 3. Auto-create patient profile
        Patient patient = new Patient();
        patient.setStudent(saved);
        patient.setDateOfBirth(req.dateOfBirth());
        patient.setBloodgroup(req.bloodgroup());
        patient.setSex(req.sex());
        patient.setAllergies(req.allergies());
        patient.setEmergencyContactName(req.emergencyContactName());
        patient.setEmergencyContactPhone(req.emergencyContactPhone());
        patientRepo.save(patient);

        return StudentResponse.fromEntity(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public StudentResponse update(@PathVariable int id, @RequestBody UpdateStudentRequest req) {
        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        if (req.name() != null) existing.setName(req.name());
        if (req.email() != null) existing.setEmail(req.email());
        if (req.phone() != null) existing.setPhone(req.phone());
        if (req.issuedOn() != null) existing.setIssuedOn(req.issuedOn());
        if (req.isActive() != null) existing.setIsActive(req.isActive());
        if (req.emailVerified() != null) existing.setEmailVerified(req.emailVerified());
        if (req.password() != null && !req.password().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(req.password()));
        }
        return StudentResponse.fromEntity(studentRepo.save(existing));
    }

    @PatchMapping("/{id}/activate")
    @Transactional
    public StudentResponse toggleActive(@PathVariable int id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        student.setIsActive(!student.getIsActive());
        return StudentResponse.fromEntity(studentRepo.save(student));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable int id) {
        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        // Delete patient profile first (FK constraint), then student
        patientRepo.findByStudent_StudentId(id).ifPresent(patientRepo::delete);
        studentRepo.delete(student);
    }

    public record CreateStudentRequest(
            Integer studentId,
            String name,
            String email,
            String phone,
            String password,
            LocalDate issuedOn,
            LocalDate dateOfBirth,
            String bloodgroup,
            String sex,
            String allergies,
            String emergencyContactName,
            String emergencyContactPhone
    ) {}

    public record UpdateStudentRequest(
            String name,
            String email,
            String phone,
            String password,
            LocalDate issuedOn,
            Boolean isActive,
            Boolean emailVerified
    ) {}
}
