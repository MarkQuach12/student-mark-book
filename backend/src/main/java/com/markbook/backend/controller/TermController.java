package com.markbook.backend.controller;

import lombok.RequiredArgsConstructor;

import com.markbook.backend.dto.TermDTO;
import com.markbook.backend.service.TermService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/terms")
@RequiredArgsConstructor
public class TermController {

    private final TermService termService;

    @GetMapping
    public List<TermDTO> getTerms() {
        return termService.getAllTerms().stream()
                .map(TermDTO::from)
                .toList();
    }
}
