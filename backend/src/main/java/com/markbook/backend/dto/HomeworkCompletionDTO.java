package com.markbook.backend.dto;

import com.markbook.backend.model.HomeworkCompletion;

import java.util.UUID;

public record HomeworkCompletionDTO(UUID studentId, UUID homeworkId, Boolean completed) {
    public static HomeworkCompletionDTO from(HomeworkCompletion c) {
        return new HomeworkCompletionDTO(c.getStudent().getId(),
                c.getHomework().getId(), c.getCompleted());
    }
}
