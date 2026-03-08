package com.markbook.backend.controller;

import com.markbook.backend.service.TermService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terms")
public class TermController {

    private final TermService termService;

    public TermController(TermService termService) {
        this.termService = termService;
    }

    @GetMapping
    public List<Map<String, Object>> getTerms() {
        return termService.getAllTerms().stream()
                .map(t -> Map.<String, Object>of(
                        "key", t.getKey(),
                        "label", t.getLabel(),
                        "weeks", t.getWeeks().stream()
                                .map(w -> Map.of(
                                        "weekIndex", w.getWeekIndex(),
                                        "label", w.getLabel(),
                                        "dateRange", w.getDateRange()
                                ))
                                .toList()
                ))
                .toList();
    }
}
