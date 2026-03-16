package com.markbook.backend.repository;

import com.markbook.backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {

    @Query("SELECT t FROM Topic t LEFT JOIN FETCH t.resources WHERE t.classLevel = :classLevel ORDER BY t.sortOrder")
    List<Topic> findByClassLevelWithResources(@Param("classLevel") String classLevel);

}
