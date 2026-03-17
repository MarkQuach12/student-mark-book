package com.markbook.backend.dto;

import com.markbook.backend.model.ClassEntity;

import java.util.UUID;

public record ClassDTO(UUID id, String classLevel, String dayOfWeek,
                       String startTime, String endTime, String name, String label) {
    public static ClassDTO from(ClassEntity c) {
        return new ClassDTO(c.getId(), c.getClassLevel(), c.getDayOfWeek(),
                c.getStartTime().toString(), c.getEndTime().toString(), c.getName(), c.getLabel());
    }
}
