package com.markbook.backend.repository;

import com.markbook.backend.model.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByClassEntityId(UUID classId);
    List<Homework> findByClassEntityIdAndTermKeyAndWeekIndex(UUID classId, String termKey, Short weekIndex);
}
