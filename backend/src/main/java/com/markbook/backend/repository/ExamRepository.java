package com.markbook.backend.repository;

import com.markbook.backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
    List<Exam> findByUserId(String userId);
    List<Exam> findByUserIdAndExamDateBetween(String userId, LocalDate start, LocalDate end);
}
