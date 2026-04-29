package com.markbook.backend.repository;

import com.markbook.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByTopicIdOrderBySortOrder(UUID topicId);
    boolean existsByTopicIdAndTitleIgnoreCase(UUID topicId, String title);
}
