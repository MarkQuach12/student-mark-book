package com.markbook.backend.dto;

import com.markbook.backend.model.Exam;

import java.util.UUID;

public record ExamDTO(UUID id, String title, String examDate) {
    public static ExamDTO from(Exam e) {
        return new ExamDTO(e.getId(), e.getTitle(), e.getExamDate().toString());
    }
}
