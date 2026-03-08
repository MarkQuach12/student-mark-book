package com.markbook.backend.repository;

import com.markbook.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    List<Payment> findByStudentClassEntityId(UUID classId);
    Optional<Payment> findByStudentIdAndTermKeyAndWeekIndex(UUID studentId, String termKey, Short weekIndex);
}
