package com.markbook.backend.repository;

import com.markbook.backend.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {
    @Query("SELECT e FROM Exam e JOIN FETCH e.classEntity WHERE e.classEntity.id = :classId")
    List<Exam> findByClassEntityId(@Param("classId") UUID classId);

    @Query("SELECT e FROM Exam e JOIN FETCH e.classEntity WHERE e.classEntity.id IN :classIds")
    List<Exam> findByClassEntityIdIn(@Param("classIds") List<UUID> classIds);

    @Query("SELECT e FROM Exam e JOIN FETCH e.classEntity WHERE e.classEntity.id IN :classIds AND e.examDate BETWEEN :start AND :end")
    List<Exam> findByClassEntityIdInAndExamDateBetween(@Param("classIds") List<UUID> classIds, @Param("start") LocalDate start, @Param("end") LocalDate end);

    void deleteByClassEntityId(UUID classId);
}
