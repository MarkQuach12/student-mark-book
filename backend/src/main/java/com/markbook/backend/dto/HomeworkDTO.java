package com.markbook.backend.dto;

import com.markbook.backend.model.Homework;

import java.util.UUID;

public record HomeworkDTO(UUID id, String title, String termKey, Short weekIndex) {
    public static HomeworkDTO from(Homework h) {
        return new HomeworkDTO(h.getId(), h.getTitle(), h.getTerm().getKey(), h.getWeekIndex());
    }
}
