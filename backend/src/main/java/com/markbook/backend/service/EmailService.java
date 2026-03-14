package com.markbook.backend.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final String apiKey;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY not configured — skipping password reset email to {}", to);
            log.info("Reset link (dev): {}", resetLink);
            return;
        }

        Resend resend = new Resend(apiKey);
        CreateEmailOptions options = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(to)
                .subject("Reset your password")
                .html("<p>Click the link below to reset your password. This link expires in 1 hour.</p>" +
                      "<p><a href=\"" + resetLink + "\">Reset password</a></p>" +
                      "<p>If you did not request a password reset, you can ignore this email.</p>")
                .build();

        try {
            resend.emails().send(options);
            log.info("Password reset email sent to {}", to);
        } catch (ResendException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send reset email", e);
        }
    }
}
