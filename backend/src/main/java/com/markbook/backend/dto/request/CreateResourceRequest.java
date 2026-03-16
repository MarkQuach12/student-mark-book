package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateResourceRequest(
    @NotBlank String title,
    @NotBlank String driveUrl
) {}
