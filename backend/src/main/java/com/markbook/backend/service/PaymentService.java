package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Payment;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final TermRepository termRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          StudentRepository studentRepository,
                          TermRepository termRepository) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.termRepository = termRepository;
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByClassId(UUID classId) {
        return paymentRepository.findByClassIdWithFetch(classId);
    }

    @Transactional
    public Payment updatePayment(UUID studentId, String termKey, Short weekIndex, String status) {
        return paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(studentId, termKey, weekIndex)
                .map(existing -> {
                    log.info("Updating payment status studentId={} termKey={} weekIndex={} status={}", studentId, termKey, weekIndex, status);
                    existing.setStatus(status);
                    return paymentRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.debug("Creating payment studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex);
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    Term term = termRepository.findById(termKey)
                            .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

                    Payment payment = new Payment();
                    payment.setStudent(student);
                    payment.setTerm(term);
                    payment.setWeekIndex(weekIndex);
                    payment.setStatus(status);
                    return paymentRepository.save(payment);
                });
    }
}
