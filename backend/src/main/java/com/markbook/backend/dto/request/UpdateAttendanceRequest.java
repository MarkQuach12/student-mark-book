package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdateAttendanceRequest(
        @NotNull(message = "studentId is required") UUID studentId,
        @NotBlank(message = "termKey is required") String termKey,
        @NotNull(message = "weekIndex is required") Short weekIndex,
        @NotNull(message = "present is required") Boolean present
) {}
