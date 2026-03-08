package com.markbook.backend.repository;

import com.markbook.backend.model.Term;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TermRepository extends JpaRepository<Term, String> {
    List<Term> findAllByOrderBySortOrderAsc();
}
