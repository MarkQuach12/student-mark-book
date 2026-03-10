package com.markbook.backend.controller;

import com.markbook.backend.dto.TermDTO;
import com.markbook.backend.service.TermService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
public class TermController {

    private final TermService termService;

    public TermController(TermService termService) {
        this.termService = termService;
    }

    @GetMapping
    public List<TermDTO> getTerms() {
        return termService.getAllTerms().stream()
                .map(TermDTO::from)
                .toList();
    }
}
