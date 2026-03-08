package com.markbook.backend.repository;

import com.markbook.backend.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    List<ClassEntity> findByUserId(String userId);
}
