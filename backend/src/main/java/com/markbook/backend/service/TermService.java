package com.markbook.backend.service;

import lombok.RequiredArgsConstructor;

import com.markbook.backend.model.Term;
import com.markbook.backend.repository.TermRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TermService {

    private final TermRepository termRepository;

    @Cacheable("terms")
    @Transactional(readOnly = true)
    public List<Term> getAllTerms() {
        return termRepository.findAllWithWeeks();
    }
}
