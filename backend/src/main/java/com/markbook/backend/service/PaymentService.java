package com.markbook.backend.service;

import com.markbook.backend.model.Payment;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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

    public List<Payment> getPaymentsByClassId(UUID classId) {
        return paymentRepository.findByStudentClassEntityId(classId);
    }

    public Payment updatePayment(UUID studentId, String termKey, Short weekIndex, String status) {
        return paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(studentId, termKey, weekIndex)
                .map(existing -> {
                    existing.setStatus(status);
                    return paymentRepository.save(existing);
                })
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));
                    Term term = termRepository.findById(termKey)
                            .orElseThrow(() -> new RuntimeException("Term not found"));

                    Payment payment = new Payment();
                    payment.setStudent(student);
                    payment.setTerm(term);
                    payment.setWeekIndex(weekIndex);
                    payment.setStatus(status);
                    return paymentRepository.save(payment);
                });
    }
}
