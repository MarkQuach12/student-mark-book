package com.markbook.backend.repository;

import com.markbook.backend.model.HomeworkCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HomeworkCompletionRepository extends JpaRepository<HomeworkCompletion, UUID> {
    Optional<HomeworkCompletion> findByStudentIdAndHomeworkId(UUID studentId, UUID homeworkId);

    @Query("SELECT c FROM HomeworkCompletion c JOIN FETCH c.student JOIN FETCH c.homework WHERE c.homework.classEntity.id = :classId")
    List<HomeworkCompletion> findByClassIdWithFetch(@Param("classId") UUID classId);
}
