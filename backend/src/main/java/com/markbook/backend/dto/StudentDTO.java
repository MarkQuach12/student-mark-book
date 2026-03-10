package com.markbook.backend.dto;

import com.markbook.backend.model.Student;

import java.util.UUID;

public record StudentDTO(UUID id, String name) {
    public static StudentDTO from(Student s) {
        return new StudentDTO(s.getId(), s.getName());
    }
}
