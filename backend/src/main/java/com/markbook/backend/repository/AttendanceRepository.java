package com.markbook.backend.repository;

import com.markbook.backend.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByStudentClassEntityId(UUID classId);
    Optional<Attendance> findByStudentIdAndTermKeyAndWeekIndex(UUID studentId, String termKey, Short weekIndex);
}
