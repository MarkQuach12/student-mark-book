package com.markbook.backend.config;

import com.markbook.backend.model.Term;
import com.markbook.backend.model.TermWeek;
import com.markbook.backend.repository.TermRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds the canonical term + week structure if the table is empty.
 * Runs before DemoService.ensureDemoAccount() (which depends on terms existing).
 * Idempotent: only inserts when the terms table is empty.
 */
@Slf4j
@Component
@Order(0)
public class TermSeeder implements ApplicationRunner {

    private final TermRepository termRepository;

    public TermSeeder(TermRepository termRepository) {
        this.termRepository = termRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (termRepository.count() > 0) {
            log.info("Terms already seeded, skipping");
            return;
        }

        log.info("Seeding terms and weeks...");
        List<Term> terms = new ArrayList<>();
        short order = 0;

        terms.add(buildTerm("term1", "Term 1", order++, List.of(
                week(1, "Week 1", "2 Feb – 8 Feb"),
                week(2, "Week 2", "9 Feb – 15 Feb"),
                week(3, "Week 3", "16 Feb – 22 Feb"),
                week(4, "Week 4", "23 Feb – 1 Mar"),
                week(5, "Week 5", "2 Mar – 8 Mar"),
                week(6, "Week 6", "9 Mar – 15 Mar"),
                week(7, "Week 7", "16 Mar – 22 Mar"),
                week(8, "Week 8", "23 Mar – 29 Mar"),
                week(9, "Week 9", "30 Mar – 5 Apr")
        )));

        terms.add(buildTerm("term1Holiday", "Term 1 Holiday", order++, List.of(
                week(1, "Holiday Week 1", "6 Apr – 12 Apr"),
                week(2, "Holiday Week 2", "13 Apr – 19 Apr")
        )));

        terms.add(buildTerm("term2", "Term 2", order++, List.of(
                week(1, "Week 1", "20 Apr – 26 Apr"),
                week(2, "Week 2", "27 Apr – 3 May"),
                week(3, "Week 3", "4 May – 10 May"),
                week(4, "Week 4", "11 May – 17 May"),
                week(5, "Week 5", "18 May – 24 May"),
                week(6, "Week 6", "25 May – 31 May"),
                week(7, "Week 7", "1 Jun – 7 Jun"),
                week(8, "Week 8", "8 Jun – 14 Jun"),
                week(9, "Week 9", "15 Jun – 21 Jun"),
                week(10, "Week 10", "22 Jun – 28 Jun"),
                week(11, "Week 11", "29 Jun – 5 Jul")
        )));

        terms.add(buildTerm("term2Holiday", "Term 2 Holiday", order++, List.of(
                week(1, "Holiday Week 1", "6 Jul – 12 Jul"),
                week(2, "Holiday Week 2", "13 Jul – 19 Jul")
        )));

        terms.add(buildTerm("term3", "Term 3", order++, List.of(
                week(1, "Week 1", "20 Jul – 26 Jul"),
                week(2, "Week 2", "27 Jul – 2 Aug"),
                week(3, "Week 3", "3 Aug – 9 Aug"),
                week(4, "Week 4", "10 Aug – 16 Aug"),
                week(5, "Week 5", "17 Aug – 23 Aug"),
                week(6, "Week 6", "24 Aug – 30 Aug"),
                week(7, "Week 7", "31 Aug – 6 Sep"),
                week(8, "Week 8", "7 Sep – 13 Sep"),
                week(9, "Week 9", "14 Sep – 20 Sep"),
                week(10, "Week 10", "21 Sep – 27 Sep")
        )));

        terms.add(buildTerm("term3Holiday", "Term 3 Holiday", order++, List.of(
                week(1, "Holiday Week 1", "28 Sep – 4 Oct"),
                week(2, "Holiday Week 2", "5 Oct – 11 Oct")
        )));

        terms.add(buildTerm("term4", "Term 4", order++, List.of(
                week(1, "Week 1", "12 Oct – 18 Oct"),
                week(2, "Week 2", "19 Oct – 25 Oct"),
                week(3, "Week 3", "26 Oct – 1 Nov"),
                week(4, "Week 4", "2 Nov – 8 Nov"),
                week(5, "Week 5", "9 Nov – 15 Nov"),
                week(6, "Week 6", "16 Nov – 22 Nov"),
                week(7, "Week 7", "23 Nov – 29 Nov"),
                week(8, "Week 8", "30 Nov – 6 Dec"),
                week(9, "Week 9", "7 Dec – 13 Dec"),
                week(10, "Week 10", "14 Dec – 20 Dec")
        )));

        termRepository.saveAll(terms);
        log.info("Seeded {} terms", terms.size());
    }

    private Term buildTerm(String key, String label, short sortOrder, List<TermWeek> weeks) {
        Term term = new Term();
        term.setKey(key);
        term.setLabel(label);
        term.setSortOrder(sortOrder);
        weeks.forEach(w -> w.setTerm(term));
        term.setWeeks(new ArrayList<>(weeks));
        return term;
    }

    private TermWeek week(int index, String label, String dateRange) {
        TermWeek w = new TermWeek();
        w.setWeekIndex((short) index);
        w.setLabel(label);
        w.setDateRange(dateRange);
        return w;
    }
}
