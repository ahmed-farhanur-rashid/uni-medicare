package com.uni.medicare.auth;

import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Called by JwtAuthFilter for every student request.
 * A student is valid only if is_active = true AND expires_on >= today.
 */
@Component
@RequiredArgsConstructor
public class StudentValidityFilter {

    private final EntityManager em;

    public boolean isStudentValid(int studentId) {
        Student s = em.find(Student.class, studentId);
        if (s == null) return false;
        return s.getIsActive()
                && s.getExpiresOn() != null
                && !s.getExpiresOn().isBefore(LocalDate.now());
    }
}
