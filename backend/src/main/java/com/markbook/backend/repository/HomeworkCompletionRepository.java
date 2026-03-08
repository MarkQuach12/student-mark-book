package com.markbook.backend.repository;

import com.markbook.backend.model.HomeworkCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HomeworkCompletionRepository extends JpaRepository<HomeworkCompletion, UUID> {
    List<HomeworkCompletion> findByHomeworkClassEntityId(UUID classId);
    Optional<HomeworkCompletion> findByStudentIdAndHomeworkId(UUID studentId, UUID homeworkId);
}
