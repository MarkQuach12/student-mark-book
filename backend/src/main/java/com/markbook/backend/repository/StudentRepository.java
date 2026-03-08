package com.markbook.backend.repository;

import com.markbook.backend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    List<Student> findByClassEntityId(UUID classId);
}
