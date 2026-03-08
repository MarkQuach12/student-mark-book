package com.markbook.backend.service;

import com.markbook.backend.model.Term;
import com.markbook.backend.repository.TermRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TermService {

    private final TermRepository termRepository;

    public TermService(TermRepository termRepository) {
        this.termRepository = termRepository;
    }

    public List<Term> getAllTerms() {
        return termRepository.findAllByOrderBySortOrderAsc();
    }
}
