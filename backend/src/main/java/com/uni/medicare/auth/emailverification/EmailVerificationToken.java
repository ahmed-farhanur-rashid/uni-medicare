package com.uni.medicare.auth.emailverification;

import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verification_tokens")
@Getter @Setter
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tokenId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime usedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isUsed() {
        return usedAt != null;
    }

    public boolean isValid() {
        return !isExpired() && !isUsed();
    }
}
