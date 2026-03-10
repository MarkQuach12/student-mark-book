package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ToggleCompletionRequest(
        @NotNull(message = "studentId is required") UUID studentId,
        @NotNull(message = "homeworkId is required") UUID homeworkId
) {}
