package com.markbook.backend.dto;

public record AuthResponse(String token, String id, String name, String email, String role) {}
