package com.markbook.backend.service;

import com.markbook.backend.model.Attendance;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TermRepository termRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();
    private static final String TERM_KEY = "term1";
    private static final Short WEEK_INDEX = (short) 3;

    private Student buildStudent(UUID id) {
        Student student = new Student();
        student.setId(id);
        student.setName("Alice");
        return student;
    }

    private Term buildTerm(String key) {
        Term term = new Term();
        term.setKey(key);
        term.setLabel("Term 1");
        return term;
    }

    private Attendance buildAttendance(UUID id, Student student, Term term, Short weekIndex, Boolean present) {
        Attendance attendance = new Attendance();
        attendance.setId(id);
        attendance.setStudent(student);
        attendance.setTerm(term);
        attendance.setWeekIndex(weekIndex);
        attendance.setPresent(present);
        return attendance;
    }

    // -------------------------------------------------------
    // getAttendanceByClassId
    // -------------------------------------------------------
    @Nested
    class GetAttendanceByClassId {

        @Test
        void returnsAllAttendanceRecordsForClass() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm(TERM_KEY);
            Attendance a1 = buildAttendance(UUID.randomUUID(), student, term, (short) 1, true);
            Attendance a2 = buildAttendance(UUID.randomUUID(), student, term, (short) 2, false);
            when(attendanceRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(a1, a2));

            List<Attendance> result = attendanceService.getAttendanceByClassId(CLASS_ID);

            assertEquals(2, result.size());
            verify(attendanceRepository).findByClassIdWithFetch(CLASS_ID);
        }
    }

    // -------------------------------------------------------
    // updateAttendance
    // -------------------------------------------------------
    @Nested
    class UpdateAttendance {

        @Test
        void updatesExistingAttendanceRecord() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm(TERM_KEY);
            Attendance existing = buildAttendance(UUID.randomUUID(), student, term, WEEK_INDEX, false);
            when(attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, TERM_KEY, WEEK_INDEX))
                    .thenReturn(Optional.of(existing));
            when(attendanceRepository.save(existing)).thenReturn(existing);

            Attendance result = attendanceService.updateAttendance(STUDENT_ID, TERM_KEY, WEEK_INDEX, true);

            assertTrue(result.getPresent());
            verify(attendanceRepository).save(existing);
            verify(studentRepository, never()).findById(any());
            verify(termRepository, never()).findById(any());
        }

        @Test
        void createsNewAttendanceRecordWhenNoneExists() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm(TERM_KEY);
            when(attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, TERM_KEY, WEEK_INDEX))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(termRepository.findById(TERM_KEY)).thenReturn(Optional.of(term));
            when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

            Attendance result = attendanceService.updateAttendance(STUDENT_ID, TERM_KEY, WEEK_INDEX, true);

            assertNotNull(result);
            verify(attendanceRepository).save(any(Attendance.class));
        }

        @Test
        void setsCorrectFieldsOnNewRecord() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm(TERM_KEY);
            when(attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, TERM_KEY, WEEK_INDEX))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(termRepository.findById(TERM_KEY)).thenReturn(Optional.of(term));
            when(attendanceRepository.save(any(Attendance.class))).thenAnswer(inv -> inv.getArgument(0));

            attendanceService.updateAttendance(STUDENT_ID, TERM_KEY, WEEK_INDEX, true);

            ArgumentCaptor<Attendance> captor = ArgumentCaptor.forClass(Attendance.class);
            verify(attendanceRepository).save(captor.capture());
            Attendance saved = captor.getValue();
            assertEquals(student, saved.getStudent());
            assertEquals(term, saved.getTerm());
            assertEquals(WEEK_INDEX, saved.getWeekIndex());
            assertTrue(saved.getPresent());
        }

        @Test
        void returnsTheSavedAttendanceRecord() {
            Student student = buildStudent(STUDENT_ID);
            Term term = buildTerm(TERM_KEY);
            Attendance savedAttendance = buildAttendance(UUID.randomUUID(), student, term, WEEK_INDEX, true);
            when(attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(STUDENT_ID, TERM_KEY, WEEK_INDEX))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(termRepository.findById(TERM_KEY)).thenReturn(Optional.of(term));
            when(attendanceRepository.save(any(Attendance.class))).thenReturn(savedAttendance);

            Attendance result = attendanceService.updateAttendance(STUDENT_ID, TERM_KEY, WEEK_INDEX, true);

            assertSame(savedAttendance, result);
        }
    }
}
