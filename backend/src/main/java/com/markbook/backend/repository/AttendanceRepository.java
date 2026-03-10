package com.markbook.backend.repository;

import com.markbook.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByStudentClassEntityId(UUID classId);
    Optional<Attendance> findByStudentIdAndTermKeyAndWeekIndex(UUID studentId, String termKey, Short weekIndex);

    @Query("SELECT a FROM Attendance a JOIN FETCH a.student JOIN FETCH a.term WHERE a.student.classEntity.id = :classId")
    List<Attendance> findByClassIdWithFetch(@Param("classId") UUID classId);
}
