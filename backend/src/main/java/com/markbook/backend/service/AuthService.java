package com.markbook.backend.service;

import com.markbook.backend.dto.AuthResponse;
import com.markbook.backend.model.PasswordResetToken;
import com.markbook.backend.model.User;
import com.markbook.backend.repository.PasswordResetTokenRepository;
import com.markbook.backend.repository.UserRepository;
import com.markbook.backend.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final String frontendUrl;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       PasswordResetTokenRepository tokenRepository,
                       EmailService emailService,
                       @Value("${app.frontend-url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public AuthResponse signup(String name, String email, String password) {
        String normalizedEmail = email.toLowerCase().trim();
        if (userRepository.findById(normalizedEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = new User(normalizedEmail, name.trim(), normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("USER");
        userRepository.save(user);

        log.info("New user signed up: {}", normalizedEmail);
        String token = jwtUtil.generateToken(normalizedEmail, "USER");
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String email, String password) {
        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> optUser = userRepository.findById(normalizedEmail);

        if (optUser.isEmpty() || optUser.get().getPasswordHash() == null
                || !passwordEncoder.matches(password, optUser.get().getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        User user = optUser.get();
        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole());
    }

    @Transactional
    public void forgotPassword(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        Optional<User> optUser = userRepository.findById(normalizedEmail);
        if (optUser.isEmpty()) {
            // Silently no-op to avoid leaking user existence
            return;
        }

        tokenRepository.deleteByUserEmail(normalizedEmail);

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusHours(1);
        tokenRepository.save(new PasswordResetToken(token, normalizedEmail, expiresAt));

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(normalizedEmail, resetLink);
        log.info("Password reset requested for {}", normalizedEmail);
    }

    @Transactional(readOnly = true)
    public void validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid link."));
        if (resetToken.isUsed() || OffsetDateTime.now().isAfter(resetToken.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid link.");
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset link."));

        if (resetToken.isUsed()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has already been used.");
        }
        if (OffsetDateTime.now().isAfter(resetToken.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This reset link has expired.");
        }

        User user = userRepository.findById(resetToken.getUserEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found."));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password reset successfully for {}", resetToken.getUserEmail());
    }
}
