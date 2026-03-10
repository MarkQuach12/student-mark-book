package com.markbook.backend.repository;

import com.markbook.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByStudentClassEntityId(UUID classId);
    Optional<Payment> findByStudentIdAndTermKeyAndWeekIndex(UUID studentId, String termKey, Short weekIndex);

    @Query("SELECT p FROM Payment p JOIN FETCH p.student JOIN FETCH p.term WHERE p.student.classEntity.id = :classId")
    List<Payment> findByClassIdWithFetch(@Param("classId") UUID classId);
}
