package com.markbook.backend.controller;

import com.markbook.backend.dto.AuthResponse;
import com.markbook.backend.dto.request.ForgotPasswordRequest;
import com.markbook.backend.dto.request.LoginRequest;
import com.markbook.backend.dto.request.ResetPasswordRequest;
import com.markbook.backend.dto.request.SignupRequest;
import com.markbook.backend.service.AuthService;
import com.markbook.backend.service.DemoService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final DemoService demoService;

    public AuthController(AuthService authService, DemoService demoService) {
        this.authService = authService;
        this.demoService = demoService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@RequestBody @Valid SignupRequest body) {
        log.info("[AuthController] POST /api/auth/signup email={}", body.email());
        return authService.signup(body.name(), body.email(), body.password());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest body) {
        log.info("[AuthController] POST /api/auth/login email={}", body.email());
        return authService.login(body.email(), body.password());
    }

    @PostMapping("/demo")
    public AuthResponse demo() {
        return demoService.getDemoSession();
    }

    @PostMapping("/demo-admin")
    public AuthResponse demoAdmin() {
        return demoService.getDemoAdminSession();
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Void> validateResetToken(@RequestParam String token) {
        authService.validateResetToken(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody @Valid ForgotPasswordRequest body) {
        authService.forgotPassword(body.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody @Valid ResetPasswordRequest body) {
        authService.resetPassword(body.token(), body.newPassword());
        return ResponseEntity.ok().build();
    }
}
