package com.uni.medicare.auth.passwordreset;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter @Setter
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer tokenId;

    @Column(nullable = false, length = 10)
    private String userType; // 'student' or 'staff'

    @Column(nullable = false)
    private Integer userId;

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
