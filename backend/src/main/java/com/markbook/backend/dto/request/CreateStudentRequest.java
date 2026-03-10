package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStudentRequest(
        @NotBlank(message = "name is required")
        @Size(max = 100, message = "name must be 100 characters or fewer")
        String name
) {}
