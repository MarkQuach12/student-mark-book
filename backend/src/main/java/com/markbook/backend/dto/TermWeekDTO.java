package com.markbook.backend.dto;

import com.markbook.backend.model.TermWeek;

public record TermWeekDTO(Short weekIndex, String label, String dateRange) {
    public static TermWeekDTO from(TermWeek w) {
        return new TermWeekDTO(w.getWeekIndex(), w.getLabel(), w.getDateRange());
    }
}
