package com.markbook.backend.service;

import com.markbook.backend.model.Term;
import com.markbook.backend.model.TermWeek;
import com.markbook.backend.repository.TermRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TermServiceTest {

    @Mock
    private TermRepository termRepository;

    @InjectMocks
    private TermService termService;

    // -------------------------------------------------------
    // getAllTerms
    // -------------------------------------------------------
    @Nested
    class GetAllTerms {

        @Test
        void returnsAllTermsWithWeeks() {
            Term term1 = new Term();
            term1.setKey("term1");
            term1.setLabel("Term 1");
            TermWeek week = new TermWeek();
            week.setWeekIndex((short) 1);
            week.setLabel("Week 1");
            week.setDateRange("3 Feb – 9 Feb");
            term1.setWeeks(List.of(week));

            Term term2 = new Term();
            term2.setKey("term2");
            term2.setLabel("Term 2");
            term2.setWeeks(List.of());

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term1, term2));

            List<Term> result = termService.getAllTerms();

            assertEquals(2, result.size());
            assertEquals("term1", result.get(0).getKey());
            assertEquals(1, result.get(0).getWeeks().size());
            verify(termRepository).findAllWithWeeks();
        }

        @Test
        void returnsEmptyListWhenNoTerms() {
            when(termRepository.findAllWithWeeks()).thenReturn(List.of());

            List<Term> result = termService.getAllTerms();

            assertTrue(result.isEmpty());
        }
    }
}
