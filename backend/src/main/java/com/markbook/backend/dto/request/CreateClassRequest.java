package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateClassRequest(
        @NotBlank(message = "classLevel is required") String classLevel,
        @NotBlank(message = "dayOfWeek is required") String dayOfWeek,
        @NotNull(message = "startTime is required") String startTime,
        @NotNull(message = "endTime is required") String endTime,
        String label
) {}
