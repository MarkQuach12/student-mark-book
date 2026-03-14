package com.markbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @Column(name = "token", nullable = false)
    private String token;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "used", nullable = false)
    private boolean used = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public PasswordResetToken(String token, String userEmail, OffsetDateTime expiresAt) {
        this.token = token;
        this.userEmail = userEmail;
        this.expiresAt = expiresAt;
        this.createdAt = OffsetDateTime.now();
    }
}
