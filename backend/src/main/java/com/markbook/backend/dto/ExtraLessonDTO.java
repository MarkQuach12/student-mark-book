package com.markbook.backend.dto;

import com.markbook.backend.model.ExtraLesson;

import java.util.UUID;

public record ExtraLessonDTO(UUID id, String title, String lessonDate, String startTime, String endTime, UUID classId, String classLevel) {
    public static ExtraLessonDTO from(ExtraLesson e) {
        return new ExtraLessonDTO(
                e.getId(),
                e.getTitle(),
                e.getLessonDate().toString(),
                e.getStartTime().toString(),
                e.getEndTime().toString(),
                e.getClassEntity().getId(),
                e.getClassEntity().getClassLevel()
        );
    }
}
