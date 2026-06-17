package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ChatRequest(
        @NotBlank String message,
        List<ChatTurn> history
) {
    /** A prior conversation turn supplied by the client. role is "user" or "bot". */
    public record ChatTurn(String role, String text) {}
}
