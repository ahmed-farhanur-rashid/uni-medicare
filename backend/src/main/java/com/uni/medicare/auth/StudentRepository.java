package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByStudentId(Integer studentId);
    Optional<Student> findByEmail(String email);
}
