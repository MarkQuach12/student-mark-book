package com.markbook.backend.repository;

import com.markbook.backend.model.ExtraLesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExtraLessonRepository extends JpaRepository<ExtraLesson, UUID> {

    @Query("SELECT e FROM ExtraLesson e JOIN FETCH e.classEntity WHERE e.classEntity.id = :classId")
    List<ExtraLesson> findByClassEntityId(@Param("classId") UUID classId);

    @Query("SELECT e FROM ExtraLesson e JOIN FETCH e.classEntity WHERE e.lessonDate BETWEEN :start AND :end")
    List<ExtraLesson> findByLessonDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT e FROM ExtraLesson e JOIN FETCH e.classEntity WHERE e.classEntity.id IN :classIds")
    List<ExtraLesson> findByClassEntityIdIn(@Param("classIds") List<UUID> classIds);

    @Query("SELECT e FROM ExtraLesson e JOIN FETCH e.classEntity WHERE e.classEntity.id IN :classIds AND e.lessonDate BETWEEN :start AND :end")
    List<ExtraLesson> findByClassEntityIdInAndLessonDateBetween(@Param("classIds") List<UUID> classIds, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
