package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Payment;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.model.TermWeek;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

    /**
     * Seeds "unpaid" payment records for a student from the current week
     * through the end of the current term. Skips weeks that already have a record.
     */
    @Transactional
    public void seedPaymentsForNewStudent(Student student) {
        LocalDate today = LocalDate.now();
        List<Term> terms = termRepository.findAllWithWeeks();

        for (Term term : terms) {
            if (term.getWeeks() == null || term.getWeeks().isEmpty()) continue;

            for (TermWeek week : term.getWeeks()) {
                LocalDate[] range = parseDateRange(week.getDateRange());
                if (range == null) continue;

                LocalDate weekStart = range[0];
                LocalDate weekEnd = range[1];

                // Only seed for current week and future weeks
                if (weekEnd.isBefore(today)) continue;

                // Don't seed for future terms — only the current term
                // A week belongs to the current term if today falls within any week of that term
                // We'll seed from current week to end of this term
                boolean isCurrentOrFutureTerm = !weekStart.isAfter(today) || isTermActive(term, today);
                if (!isCurrentOrFutureTerm) break;

                // Skip if payment already exists
                if (paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(
                        student.getId(), term.getKey(), week.getWeekIndex()).isPresent()) {
                    continue;
                }

                Payment payment = new Payment();
                payment.setStudent(student);
                payment.setTerm(term);
                payment.setWeekIndex(week.getWeekIndex());
                payment.setStatus("unpaid");
                paymentRepository.save(payment);
            }
        }

        log.info("Seeded unpaid payments for student id={} name='{}'", student.getId(), student.getName());
    }

    /**
     * Checks if today falls within any week of the given term.
     */
    private boolean isTermActive(Term term, LocalDate today) {
        if (term.getWeeks() == null || term.getWeeks().isEmpty()) return false;

        LocalDate termStart = null;
        LocalDate termEnd = null;

        for (TermWeek week : term.getWeeks()) {
            LocalDate[] range = parseDateRange(week.getDateRange());
            if (range == null) continue;
            if (termStart == null || range[0].isBefore(termStart)) termStart = range[0];
            if (termEnd == null || range[1].isAfter(termEnd)) termEnd = range[1];
        }

        return termStart != null && !today.isBefore(termStart) && !today.isAfter(termEnd);
    }

    /**
     * Parses date ranges like "16 Mar – 22 Mar" into [startDate, endDate].
     * Assumes the current year.
     */
    private LocalDate[] parseDateRange(String dateRange) {
        if (dateRange == null || !dateRange.contains("–")) return null;
        try {
            String[] parts = dateRange.split("–");
            if (parts.length != 2) return null;

            int year = LocalDate.now().getYear();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

            LocalDate start = LocalDate.parse(parts[0].trim() + " " + year, formatter);
            LocalDate end = LocalDate.parse(parts[1].trim() + " " + year, formatter);
            return new LocalDate[]{start, end};
        } catch (DateTimeParseException e) {
            log.warn("Could not parse date range: '{}'", dateRange);
            return null;
        }
    }
}
