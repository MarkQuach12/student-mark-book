package com.markbook.backend.repository;

import com.markbook.backend.model.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByClassEntityId(UUID classId);
    List<Homework> findByClassEntityIdAndTermKeyAndWeekIndex(UUID classId, String termKey, Short weekIndex);

    @Query("SELECT h FROM Homework h JOIN FETCH h.term WHERE h.classEntity.id = :classId")
    List<Homework> findByClassIdWithFetch(@Param("classId") UUID classId);
}
