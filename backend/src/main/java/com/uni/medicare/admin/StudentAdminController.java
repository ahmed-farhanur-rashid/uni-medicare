package com.uni.medicare.admin;

import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.shared.dto.StudentResponse;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.Patient;
import com.uni.medicare.shared.entity.Student;
import com.uni.medicare.shared.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/students")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class StudentAdminController {

    private final StudentRepository    studentRepo;
    private final PatientRepository    patientRepo;
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
    public StudentResponse create(@RequestBody Student student) {
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        Student saved = studentRepo.save(student);

        // Auto-create patient profile
        Patient patient = new Patient();
        patient.setStudent(saved);
        patientRepo.save(patient);

        return StudentResponse.fromEntity(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public StudentResponse update(@PathVariable int id, @RequestBody Student student) {
        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
        existing.setName(student.getName());
        existing.setEmail(student.getEmail());
        existing.setPhone(student.getPhone());
        existing.setIssuedOn(student.getIssuedOn());
        existing.setIsActive(student.getIsActive());
        existing.setEmailVerified(student.getEmailVerified());
        if (student.getPassword() != null && !student.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(student.getPassword()));
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
        studentRepo.deleteById(id);
    }
}
