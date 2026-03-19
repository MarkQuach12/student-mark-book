package com.markbook.backend.service;

import com.markbook.backend.model.Payment;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.model.TermWeek;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TermRepository termRepository;

    @InjectMocks
    private PaymentService paymentService;

    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();

    private Student buildStudent(UUID id) {
        Student student = new Student();
        student.setId(id);
        student.setName("Test Student");
        return student;
    }

    private Term buildTerm(String key, String label) {
        Term term = new Term();
        term.setKey(key);
        term.setLabel(label);
        term.setWeeks(new ArrayList<>());
        return term;
    }

    private TermWeek buildTermWeek(Term term, Short weekIndex, String dateRange) {
        TermWeek week = new TermWeek();
        week.setWeekIndex(weekIndex);
        week.setDateRange(dateRange);
        week.setTerm(term);
        return week;
    }

    private Payment buildPayment(Student student, Term term, Short weekIndex, String status) {
        Payment payment = new Payment();
        payment.setId(UUID.randomUUID());
        payment.setStudent(student);
        payment.setTerm(term);
        payment.setWeekIndex(weekIndex);
        payment.setStatus(status);
        return payment;
    }

    /**
     * Builds a date range string in "d MMM \u2013 d MMM" format for the current year,
     * given start and end LocalDate values.
     */
    private String dateRangeString(LocalDate start, LocalDate end) {
        java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("d MMM", java.util.Locale.ENGLISH);
        return start.format(fmt) + " \u2013 " + end.format(fmt);
    }

    // -------------------------------------------------------
    // getPaymentsByClassId
    // -------------------------------------------------------
    @Nested
    class GetPaymentsByClassId {

        @Test
        void returnsAllPaymentRecords() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm("term1", "Term 1");
            Payment p1 = buildPayment(student, term, (short) 1, "unpaid");
            Payment p2 = buildPayment(student, term, (short) 2, "paid");
            Payment p3 = buildPayment(student, term, (short) 3, "away");

            when(paymentRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(p1, p2, p3));

            List<Payment> result = paymentService.getPaymentsByClassId(CLASS_ID);

            assertEquals(3, result.size());
            verify(paymentRepository).findByClassIdWithFetch(CLASS_ID);
        }
    }

    // -------------------------------------------------------
    // updatePayment
    // -------------------------------------------------------
    @Nested
    class UpdatePayment {

        @Test
        void updatesExistingPaymentStatus() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm("term1", "Term 1");
            Payment existing = buildPayment(student, term, (short) 1, "unpaid");

            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 1))
                    .thenReturn(Optional.of(existing));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Payment result = paymentService.updatePayment(STUDENT_ID, "term1", (short) 1, "paid");

            assertEquals("paid", result.getStatus());
            verify(paymentRepository).save(existing);
            verify(studentRepository, never()).findById(any());
        }

        @Test
        void createsNewPaymentWhenNoneExists() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm("term1", "Term 1");

            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 2))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(termRepository.findById("term1")).thenReturn(Optional.of(term));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Payment result = paymentService.updatePayment(STUDENT_ID, "term1", (short) 2, "paid");

            assertEquals("paid", result.getStatus());
            assertEquals(student, result.getStudent());
            assertEquals(term, result.getTerm());
            assertEquals((short) 2, result.getWeekIndex());
        }

        @Test
        void acceptsValidStatuses() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm("term1", "Term 1");

            for (String status : List.of("unpaid", "paid", "away")) {
                Payment existing = buildPayment(student, term, (short) 1, "unpaid");
                when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 1))
                        .thenReturn(Optional.of(existing));
                when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

                Payment result = paymentService.updatePayment(STUDENT_ID, "term1", (short) 1, status);

                assertEquals(status, result.getStatus());
            }
        }
    }

    // -------------------------------------------------------
    // seedPaymentsForNewStudent
    // -------------------------------------------------------
    @Nested
    class SeedPaymentsForNewStudent {

        @Test
        void createsUnpaidPaymentsForCurrentAndFutureWeeksInActiveTerm() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            // Build a term with a past week, current week, and future week
            Term term = buildTerm("term1", "Term 1");
            LocalDate pastStart = today.minusDays(14);
            LocalDate pastEnd = today.minusDays(8);
            LocalDate currentStart = today.minusDays(1);
            LocalDate currentEnd = today.plusDays(5);
            LocalDate futureStart = today.plusDays(6);
            LocalDate futureEnd = today.plusDays(12);

            TermWeek pastWeek = buildTermWeek(term, (short) 1, dateRangeString(pastStart, pastEnd));
            TermWeek currentWeek = buildTermWeek(term, (short) 2, dateRangeString(currentStart, currentEnd));
            TermWeek futureWeek = buildTermWeek(term, (short) 3, dateRangeString(futureStart, futureEnd));
            term.setWeeks(List.of(pastWeek, currentWeek, futureWeek));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));
            // No existing payments
            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(eq(STUDENT_ID), eq("term1"), anyShort()))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.seedPaymentsForNewStudent(student);

            // Past week should be skipped (weekEnd.isBefore(today)), current + future should be seeded
            ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository, atLeast(2)).save(captor.capture());
            List<Payment> saved = captor.getAllValues();
            assertTrue(saved.stream().allMatch(p -> "unpaid".equals(p.getStatus())));
            assertTrue(saved.stream().allMatch(p -> p.getStudent().equals(student)));
        }

        @Test
        void skipsWeeksThatAlreadyHavePaymentRecords() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            Term term = buildTerm("term1", "Term 1");
            LocalDate currentStart = today.minusDays(1);
            LocalDate currentEnd = today.plusDays(5);
            LocalDate futureStart = today.plusDays(6);
            LocalDate futureEnd = today.plusDays(12);

            TermWeek currentWeek = buildTermWeek(term, (short) 1, dateRangeString(currentStart, currentEnd));
            TermWeek futureWeek = buildTermWeek(term, (short) 2, dateRangeString(futureStart, futureEnd));
            term.setWeeks(List.of(currentWeek, futureWeek));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));
            // Current week already has a payment
            Payment existingPayment = buildPayment(student, term, (short) 1, "paid");
            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 1))
                    .thenReturn(Optional.of(existingPayment));
            // Future week does not
            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 2))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.seedPaymentsForNewStudent(student);

            // Only the future week should be saved
            ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository, times(1)).save(captor.capture());
            assertEquals((short) 2, captor.getValue().getWeekIndex());
        }

        @Test
        void doesNothingIfNoTermIsCurrentlyActive() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            // All weeks are in the past
            Term term = buildTerm("term1", "Term 1");
            LocalDate pastStart = today.minusDays(21);
            LocalDate pastEnd = today.minusDays(15);
            LocalDate pastStart2 = today.minusDays(14);
            LocalDate pastEnd2 = today.minusDays(8);

            TermWeek week1 = buildTermWeek(term, (short) 1, dateRangeString(pastStart, pastEnd));
            TermWeek week2 = buildTermWeek(term, (short) 2, dateRangeString(pastStart2, pastEnd2));
            term.setWeeks(List.of(week1, week2));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));

            paymentService.seedPaymentsForNewStudent(student);

            verify(paymentRepository, never()).save(any(Payment.class));
        }

        @Test
        void handlesTermsWithNullOrEmptyWeeksGracefully() {
            Student student = buildStudent(STUDENT_ID);

            Term termWithNullWeeks = buildTerm("term1", "Term 1");
            termWithNullWeeks.setWeeks(null);

            Term termWithEmptyWeeks = buildTerm("term2", "Term 2");
            termWithEmptyWeeks.setWeeks(List.of());

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(termWithNullWeeks, termWithEmptyWeeks));

            paymentService.seedPaymentsForNewStudent(student);

            verify(paymentRepository, never()).save(any(Payment.class));
        }
    }

    // -------------------------------------------------------
    // parseDateRange (tested indirectly through seedPayments)
    // -------------------------------------------------------
    @Nested
    class ParseDateRange {

        @Test
        void correctlyParsesValidDateRangeFormat() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            // Use a known date range that encompasses today so it gets seeded
            Term term = buildTerm("term1", "Term 1");
            // "16 Mar \u2013 22 Mar" style — use a range that includes today
            LocalDate weekStart = today.minusDays(2);
            LocalDate weekEnd = today.plusDays(4);
            TermWeek week = buildTermWeek(term, (short) 1, dateRangeString(weekStart, weekEnd));
            term.setWeeks(List.of(week));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));
            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, "term1", (short) 1))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.seedPaymentsForNewStudent(student);

            // If parseDateRange works, a payment should be created
            verify(paymentRepository, times(1)).save(any(Payment.class));
        }

        @Test
        void returnsNullForInvalidFormatAndSkipsWeek() {
            Student student = buildStudent(STUDENT_ID);

            Term term = buildTerm("term1", "Term 1");
            // Invalid date range — no en-dash separator
            TermWeek weekInvalid = buildTermWeek(term, (short) 1, "invalid date range");
            // Also test null dateRange
            TermWeek weekNull = buildTermWeek(term, (short) 2, null);
            term.setWeeks(List.of(weekInvalid, weekNull));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));

            paymentService.seedPaymentsForNewStudent(student);

            // No payments should be saved since both date ranges are invalid
            verify(paymentRepository, never()).save(any(Payment.class));
        }
    }

    // -------------------------------------------------------
    // isTermActive (tested indirectly through seedPayments)
    // -------------------------------------------------------
    @Nested
    class IsTermActive {

        @Test
        void termIsActiveWhenTodayFallsWithinWeekRange() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            // Term where today is within the first week, and there is a future week
            Term term = buildTerm("term1", "Term 1");
            LocalDate weekStart = today.minusDays(3);
            LocalDate weekEnd = today.plusDays(3);
            LocalDate futureStart = today.plusDays(4);
            LocalDate futureEnd = today.plusDays(10);

            TermWeek currentWeek = buildTermWeek(term, (short) 1, dateRangeString(weekStart, weekEnd));
            TermWeek futureWeek = buildTermWeek(term, (short) 2, dateRangeString(futureStart, futureEnd));
            term.setWeeks(List.of(currentWeek, futureWeek));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));
            when(paymentRepository.findByStudentIdAndTermKeyAndWeekIndex(eq(STUDENT_ID), eq("term1"), anyShort()))
                    .thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            paymentService.seedPaymentsForNewStudent(student);

            // Both current and future weeks should be seeded because term is active
            ArgumentCaptor<Payment> captor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository, times(2)).save(captor.capture());
            List<Short> weekIndices = captor.getAllValues().stream()
                    .map(Payment::getWeekIndex).toList();
            assertTrue(weekIndices.contains((short) 1));
            assertTrue(weekIndices.contains((short) 2));
        }

        @Test
        void termIsNotActiveWhenTodayIsOutsideAllWeeks() {
            Student student = buildStudent(STUDENT_ID);
            LocalDate today = LocalDate.now();

            // Term where all weeks are in the future (term not yet started)
            // and weekStart.isAfter(today) so isCurrentOrFutureTerm check will call isTermActive
            // Since today is not within any week, isTermActive returns false
            Term term = buildTerm("term1", "Term 1");
            LocalDate futureStart1 = today.plusDays(30);
            LocalDate futureEnd1 = today.plusDays(36);
            LocalDate futureStart2 = today.plusDays(37);
            LocalDate futureEnd2 = today.plusDays(43);

            TermWeek week1 = buildTermWeek(term, (short) 1, dateRangeString(futureStart1, futureEnd1));
            TermWeek week2 = buildTermWeek(term, (short) 2, dateRangeString(futureStart2, futureEnd2));
            term.setWeeks(List.of(week1, week2));

            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));

            paymentService.seedPaymentsForNewStudent(student);

            // No payments should be seeded — term is not active and weeks are in the future
            verify(paymentRepository, never()).save(any(Payment.class));
        }
    }
}
