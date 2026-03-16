package com.markbook.backend.repository;

import com.markbook.backend.model.ClassTopicVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassTopicVisibilityRepository extends JpaRepository<ClassTopicVisibility, UUID> {
    List<ClassTopicVisibility> findByClassEntityId(UUID classId);
    Optional<ClassTopicVisibility> findByClassEntityIdAndTopicId(UUID classId, UUID topicId);
}
