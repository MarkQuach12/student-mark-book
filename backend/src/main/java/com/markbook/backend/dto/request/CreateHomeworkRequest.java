package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateHomeworkRequest(
        @NotBlank(message = "title is required")
        @Size(max = 100, message = "title must be 100 characters or fewer")
        String title,

        @NotBlank(message = "termKey is required") String termKey,
        @NotNull(message = "weekIndex is required") Short weekIndex
) {}
