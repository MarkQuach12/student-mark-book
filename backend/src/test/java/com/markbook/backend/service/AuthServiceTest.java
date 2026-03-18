package com.markbook.backend.service;

import com.markbook.backend.dto.AuthResponse;
import com.markbook.backend.model.PasswordResetToken;
import com.markbook.backend.model.User;
import com.markbook.backend.repository.PasswordResetTokenRepository;
import com.markbook.backend.repository.UserRepository;
import com.markbook.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private EmailService emailService;

    private AuthService authService;

    private static final String FRONTEND_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository, passwordEncoder, jwtUtil,
                tokenRepository, emailService, FRONTEND_URL);
    }

    // -------------------------------------------------------
    // signup
    // -------------------------------------------------------
    @Nested
    class Signup {

        @Test
        void successfullyCreatesUserWithHashedPassword() {
            String email = "john@example.com";
            String name = "John Doe";
            String password = "secret123";
            String hashedPassword = "hashed-secret123";
            String jwtToken = "jwt-token";

            when(userRepository.findById(email)).thenReturn(Optional.empty());
            when(passwordEncoder.encode(password)).thenReturn(hashedPassword);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtUtil.generateToken(email, "USER")).thenReturn(jwtToken);

            AuthResponse response = authService.signup(name, email, password);

            verify(passwordEncoder).encode(password);
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertEquals(hashedPassword, savedUser.getPasswordHash());
            assertEquals("USER", savedUser.getRole());
            assertEquals("John Doe", savedUser.getName());

            assertEquals(jwtToken, response.token());
            assertEquals(email, response.id());
            assertEquals("John Doe", response.name());
            assertEquals(email, response.email());
            assertEquals("USER", response.role());
        }

        @Test
        void throwsConflictWhenEmailAlreadyExists() {
            String email = "existing@example.com";
            when(userRepository.findById(email)).thenReturn(Optional.of(new User()));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.signup("Name", email, "password"));

            assertEquals(409, ex.getStatusCode().value());
        }

        @Test
        void normalizesEmailToLowercaseBeforeSaving() {
            String rawEmail = "Test@Email.COM ";
            String normalizedEmail = "test@email.com";

            when(userRepository.findById(normalizedEmail)).thenReturn(Optional.empty());
            when(passwordEncoder.encode(any())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
            when(jwtUtil.generateToken(normalizedEmail, "USER")).thenReturn("token");

            authService.signup("Test User", rawEmail, "password");

            verify(userRepository).findById(normalizedEmail);
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals(normalizedEmail, userCaptor.getValue().getId());
        }
    }

    // -------------------------------------------------------
    // login
    // -------------------------------------------------------
    @Nested
    class Login {

        @Test
        void returnsJwtTokenForValidCredentials() {
            String email = "user@example.com";
            String password = "correct-password";
            User user = new User(email, "User Name", email);
            user.setPasswordHash("hashed-password");
            user.setRole("USER");

            when(userRepository.findById(email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches(password, "hashed-password")).thenReturn(true);
            when(jwtUtil.generateToken(email, "USER")).thenReturn("jwt-token");

            AuthResponse response = authService.login(email, password);

            assertEquals("jwt-token", response.token());
            assertEquals(email, response.id());
            assertEquals("User Name", response.name());
            assertEquals("USER", response.role());
        }

        @Test
        void throwsUnauthorizedForInvalidEmail() {
            when(userRepository.findById("unknown@example.com")).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.login("unknown@example.com", "password"));

            assertEquals(401, ex.getStatusCode().value());
        }

        @Test
        void throwsUnauthorizedForWrongPassword() {
            String email = "user@example.com";
            User user = new User(email, "User", email);
            user.setPasswordHash("hashed-password");

            when(userRepository.findById(email)).thenReturn(Optional.of(user));
            when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.login(email, "wrong-password"));

            assertEquals(401, ex.getStatusCode().value());
        }
    }

    // -------------------------------------------------------
    // forgotPassword
    // -------------------------------------------------------
    @Nested
    class ForgotPassword {

        @Test
        void generatesResetTokenAndSendsEmailForExistingUser() {
            String email = "user@example.com";
            User user = new User(email, "User", email);
            when(userRepository.findById(email)).thenReturn(Optional.of(user));
            when(tokenRepository.save(any(PasswordResetToken.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            authService.forgotPassword(email);

            verify(tokenRepository).deleteByUserEmail(email);
            ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
            verify(tokenRepository).save(tokenCaptor.capture());
            PasswordResetToken savedToken = tokenCaptor.getValue();
            assertEquals(email, savedToken.getUserEmail());
            assertNotNull(savedToken.getToken());
            assertTrue(savedToken.getExpiresAt().isAfter(OffsetDateTime.now()));

            ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
            verify(emailService).sendPasswordResetEmail(eq(email), linkCaptor.capture());
            assertTrue(linkCaptor.getValue().startsWith(FRONTEND_URL + "/reset-password?token="));
        }

        @Test
        void doesNotThrowForNonExistentEmail() {
            when(userRepository.findById("nobody@example.com")).thenReturn(Optional.empty());

            assertDoesNotThrow(() -> authService.forgotPassword("nobody@example.com"));

            verify(tokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), any());
        }
    }

    // -------------------------------------------------------
    // validateResetToken
    // -------------------------------------------------------
    @Nested
    class ValidateResetToken {

        @Test
        void returnsSuccessfullyForValidUnusedNonExpiredToken() {
            PasswordResetToken resetToken = new PasswordResetToken(
                    "valid-token", "user@example.com", OffsetDateTime.now().plusHours(1));

            when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));

            assertDoesNotThrow(() -> authService.validateResetToken("valid-token"));
        }

        @Test
        void throwsForExpiredToken() {
            PasswordResetToken resetToken = new PasswordResetToken(
                    "expired-token", "user@example.com", OffsetDateTime.now().minusHours(1));

            when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(resetToken));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.validateResetToken("expired-token"));

            assertEquals(400, ex.getStatusCode().value());
        }

        @Test
        void throwsForAlreadyUsedToken() {
            PasswordResetToken resetToken = new PasswordResetToken(
                    "used-token", "user@example.com", OffsetDateTime.now().plusHours(1));
            resetToken.setUsed(true);

            when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(resetToken));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.validateResetToken("used-token"));

            assertEquals(400, ex.getStatusCode().value());
        }
    }

    // -------------------------------------------------------
    // resetPassword
    // -------------------------------------------------------
    @Nested
    class ResetPassword {

        @Test
        void updatesPasswordAndMarksTokenAsUsed() {
            String email = "user@example.com";
            PasswordResetToken resetToken = new PasswordResetToken(
                    "reset-token", email, OffsetDateTime.now().plusHours(1));
            User user = new User(email, "User", email);
            user.setPasswordHash("old-hash");

            when(tokenRepository.findByToken("reset-token")).thenReturn(Optional.of(resetToken));
            when(userRepository.findById(email)).thenReturn(Optional.of(user));
            when(passwordEncoder.encode("new-password")).thenReturn("new-hashed-password");

            authService.resetPassword("reset-token", "new-password");

            verify(passwordEncoder).encode("new-password");
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            assertEquals("new-hashed-password", userCaptor.getValue().getPasswordHash());

            ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
            verify(tokenRepository).save(tokenCaptor.capture());
            assertTrue(tokenCaptor.getValue().isUsed());
        }

        @Test
        void throwsForInvalidToken() {
            when(tokenRepository.findByToken("nonexistent-token")).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> authService.resetPassword("nonexistent-token", "password"));

            assertEquals(400, ex.getStatusCode().value());
        }
    }
}
