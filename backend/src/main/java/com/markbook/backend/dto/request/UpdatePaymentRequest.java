package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UpdatePaymentRequest(
        @NotNull(message = "studentId is required") UUID studentId,
        @NotBlank(message = "termKey is required") String termKey,
        @NotNull(message = "weekIndex is required") Short weekIndex,
        @NotBlank(message = "status is required") String status
) {}
