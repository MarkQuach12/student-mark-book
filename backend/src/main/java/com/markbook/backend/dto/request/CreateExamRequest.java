package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateExamRequest(
        @NotBlank(message = "classId is required") String classId,
        @NotBlank(message = "title is required") String title,
        @NotBlank(message = "examDate is required") String examDate
) {}
