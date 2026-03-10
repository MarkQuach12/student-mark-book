package com.markbook.backend.dto;

import com.markbook.backend.model.Attendance;

import java.util.UUID;

public record AttendanceDTO(UUID studentId, String termKey, Short weekIndex, Boolean present) {
    public static AttendanceDTO from(Attendance a) {
        return new AttendanceDTO(a.getStudent().getId(), a.getTerm().getKey(),
                a.getWeekIndex(), a.getPresent());
    }
}
