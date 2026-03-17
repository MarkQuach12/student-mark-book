package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateExtraLessonRequest(
        @NotNull(message = "classId is required") String classId,
        @NotBlank(message = "title is required") String title,
        @NotBlank(message = "lessonDate is required") String lessonDate,
        @NotBlank(message = "startTime is required") String startTime,
        @NotBlank(message = "endTime is required") String endTime
) {}
