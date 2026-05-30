package com.uni.medicare.auth.emailverification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Integer> {
    Optional<EmailVerificationToken> findByToken(String token);
}
