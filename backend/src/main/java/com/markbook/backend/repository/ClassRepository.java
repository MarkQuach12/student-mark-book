package com.markbook.backend.repository;

import com.markbook.backend.model.ClassEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClassRepository extends JpaRepository<ClassEntity, UUID> {
    List<ClassEntity> findByUserId(String userId);

    @Query("SELECT DISTINCT c FROM ClassEntity c LEFT JOIN FETCH c.students WHERE c.id = :id")
    Optional<ClassEntity> findByIdWithStudents(@Param("id") UUID id);

    @Query("SELECT c FROM ClassEntity c WHERE c.user.id = :userId AND c.dayOfWeek = :dayOfWeek " +
           "AND c.startTime < :endTime AND c.endTime > :startTime")
    List<ClassEntity> findOverlapping(@Param("userId") String userId,
                                      @Param("dayOfWeek") String dayOfWeek,
                                      @Param("startTime") LocalTime startTime,
                                      @Param("endTime") LocalTime endTime);
}
