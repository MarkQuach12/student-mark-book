package com.markbook.backend.dto;

import com.markbook.backend.model.Exam;

import java.util.UUID;

public record ExamDTO(UUID id, String title, String examDate, UUID classId, String classLevel) {
    public static ExamDTO from(Exam e) {
        return new ExamDTO(
                e.getId(),
                e.getTitle(),
                e.getExamDate().toString(),
                e.getClassEntity().getId(),
                e.getClassEntity().getClassLevel()
        );
    }
}
