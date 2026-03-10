package com.markbook.backend.dto;

import com.markbook.backend.model.Term;

import java.util.List;

public record TermDTO(String key, String label, List<TermWeekDTO> weeks) {
    public static TermDTO from(Term t) {
        return new TermDTO(t.getKey(), t.getLabel(),
                t.getWeeks().stream().map(TermWeekDTO::from).toList());
    }
}
