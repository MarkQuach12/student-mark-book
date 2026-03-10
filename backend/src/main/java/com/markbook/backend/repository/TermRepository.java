package com.markbook.backend.repository;

import com.markbook.backend.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TermRepository extends JpaRepository<Term, String> {
    List<Term> findAllByOrderBySortOrderAsc();

    @Query("SELECT DISTINCT t FROM Term t LEFT JOIN FETCH t.weeks ORDER BY t.sortOrder ASC")
    List<Term> findAllWithWeeks();
}
