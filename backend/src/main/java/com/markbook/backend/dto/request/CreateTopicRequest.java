package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateTopicRequest(@NotBlank String classLevel, @NotBlank String name) {}
