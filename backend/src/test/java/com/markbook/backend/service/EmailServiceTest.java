package com.markbook.backend.service;

import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    // -------------------------------------------------------
    // sendPasswordResetEmail
    // -------------------------------------------------------
    @Nested
    class SendPasswordResetEmail {

        @Test
        void logsLinkToConsoleWhenApiKeyNotConfigured() {
            EmailService emailService = new EmailService("", "noreply@example.com");

            // Should not throw — in dev mode it just logs the reset link
            assertDoesNotThrow(() ->
                    emailService.sendPasswordResetEmail("user@example.com", "http://localhost:5173/reset?token=abc"));
        }

        @Test
        void logsLinkWhenApiKeyIsNull() {
            EmailService emailService = new EmailService(null, "noreply@example.com");

            assertDoesNotThrow(() ->
                    emailService.sendPasswordResetEmail("user@example.com", "http://localhost:5173/reset?token=abc"));
        }

        @Test
        void handlesBlankApiKey() {
            EmailService emailService = new EmailService("   ", "noreply@example.com");

            assertDoesNotThrow(() ->
                    emailService.sendPasswordResetEmail("user@example.com", "http://localhost:5173/reset?token=abc"));
        }
    }
}
