package com.markbook.backend.repository;

import com.markbook.backend.model.UserClassAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface UserClassAssignmentRepository extends JpaRepository<UserClassAssignment, UUID> {

    @Query("SELECT a FROM UserClassAssignment a JOIN FETCH a.classEntity WHERE a.user.id = :userId")
    List<UserClassAssignment> findByUserId(@Param("userId") String userId);

    boolean existsByUserIdAndClassEntityId(String userId, UUID classId);

    @Transactional
    @Modifying
    void deleteByUserIdAndClassEntityId(String userId, UUID classId);

    void deleteByClassEntityId(UUID classId);
}
