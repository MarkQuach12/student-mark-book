package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Exam;
import com.markbook.backend.model.UserClassAssignment;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ExamRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ClassRepository classRepository;

    @Mock
    private UserClassAssignmentRepository assignmentRepository;

    @InjectMocks
    private ExamService examService;

    private static final String USER_ID = "user-123";
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID EXAM_ID = UUID.randomUUID();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsAdmin() {
        var auth = new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void authenticateAsStandardUser() {
        var auth = new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private ClassEntity buildClass(UUID id) {
        ClassEntity c = new ClassEntity();
        c.setId(id);
        c.setClassLevel("Year 10");
        c.setDayOfWeek("Monday");
        return c;
    }

    private Exam buildExam(UUID examId, ClassEntity classEntity) {
        Exam exam = new Exam();
        exam.setId(examId);
        exam.setClassEntity(classEntity);
        exam.setTitle("Math Final");
        exam.setExamDate(LocalDate.of(2026, 6, 15));
        return exam;
    }

    // -------------------------------------------------------
    // createExam
    // -------------------------------------------------------
    @Nested
    class CreateExam {

        @Test
        void adminCanCreateExamForAnyClass() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(examRepository.save(any(Exam.class))).thenAnswer(inv -> {
                Exam e = inv.getArgument(0);
                e.setId(EXAM_ID);
                return e;
            });

            Exam result = examService.createExam(USER_ID, CLASS_ID, "Science Quiz", LocalDate.of(2026, 5, 1));

            assertEquals("Science Quiz", result.getTitle());
            assertEquals(CLASS_ID, result.getClassEntity().getId());
            // Admin should NOT trigger an assignment check
            verify(assignmentRepository, never()).existsByUserIdAndClassEntityId(any(), any());
        }

        @Test
        void standardUserCanCreateExamForAssignedClass() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(true);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(examRepository.save(any(Exam.class))).thenAnswer(inv -> inv.getArgument(0));

            Exam result = examService.createExam(USER_ID, CLASS_ID, "History Test", LocalDate.of(2026, 7, 10));

            assertEquals("History Test", result.getTitle());
            verify(assignmentRepository).existsByUserIdAndClassEntityId(USER_ID, CLASS_ID);
        }

        @Test
        void standardUserCannotCreateExamForUnassignedClass() {
            authenticateAsStandardUser();
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> examService.createExam(USER_ID, CLASS_ID, "Sneaky Exam", LocalDate.of(2026, 5, 1)));

            assertEquals(403, ex.getStatusCode().value());
        }

        @Test
        void throwsWhenClassNotFound() {
            authenticateAsAdmin();
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> examService.createExam(USER_ID, CLASS_ID, "Ghost Exam", LocalDate.of(2026, 5, 1)));
        }
    }

    // -------------------------------------------------------
    // deleteExam
    // -------------------------------------------------------
    @Nested
    class DeleteExam {

        @Test
        void adminCanDeleteAnyExam() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Exam exam = buildExam(EXAM_ID, classEntity);
            when(examRepository.findById(EXAM_ID)).thenReturn(Optional.of(exam));

            examService.deleteExam(EXAM_ID, USER_ID);

            verify(examRepository).delete(exam);
        }

        @Test
        void standardUserCanDeleteExamForAssignedClass() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Exam exam = buildExam(EXAM_ID, classEntity);
            when(examRepository.findById(EXAM_ID)).thenReturn(Optional.of(exam));
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(true);

            examService.deleteExam(EXAM_ID, USER_ID);

            verify(examRepository).delete(exam);
        }

        @Test
        void standardUserCannotDeleteExamForUnassignedClass() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Exam exam = buildExam(EXAM_ID, classEntity);
            when(examRepository.findById(EXAM_ID)).thenReturn(Optional.of(exam));
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> examService.deleteExam(EXAM_ID, USER_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(examRepository, never()).delete(any());
        }

        @Test
        void throwsWhenExamNotFound() {
            authenticateAsStandardUser();
            when(examRepository.findById(EXAM_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> examService.deleteExam(EXAM_ID, USER_ID));
        }
    }

    // -------------------------------------------------------
    // getExamsForUser
    // -------------------------------------------------------
    @Nested
    class GetExamsForUser {

        @Test
        void returnsEmptyListWhenUserHasNoAssignedClasses() {
            authenticateAsStandardUser();
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            List<Exam> result = examService.getExamsForUser(USER_ID);

            assertTrue(result.isEmpty());
            verify(examRepository, never()).findByClassEntityIdIn(any());
        }

        @Test
        void returnsExamsForAssignedClasses() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));

            Exam exam = buildExam(EXAM_ID, classEntity);
            when(examRepository.findByClassEntityIdIn(List.of(CLASS_ID))).thenReturn(List.of(exam));

            List<Exam> result = examService.getExamsForUser(USER_ID);

            assertEquals(1, result.size());
            assertEquals("Math Final", result.get(0).getTitle());
        }

        @Test
        void adminSeesExamsFromAllClasses() {
            authenticateAsAdmin();
            ClassEntity c1 = buildClass(CLASS_ID);
            UUID classId2 = UUID.randomUUID();
            ClassEntity c2 = buildClass(classId2);
            when(classRepository.findAll()).thenReturn(List.of(c1, c2));

            Exam e1 = buildExam(UUID.randomUUID(), c1);
            Exam e2 = buildExam(UUID.randomUUID(), c2);
            when(examRepository.findByClassEntityIdIn(List.of(CLASS_ID, classId2))).thenReturn(List.of(e1, e2));

            List<Exam> result = examService.getExamsForUser(USER_ID);

            assertEquals(2, result.size());
            verify(assignmentRepository, never()).findByUserId(any());
        }
    }

    // -------------------------------------------------------
    // getExamsInRange
    // -------------------------------------------------------
    @Nested
    class GetExamsInRange {

        @Test
        void returnsExamsWithinDateRange() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));

            LocalDate start = LocalDate.of(2026, 6, 1);
            LocalDate end = LocalDate.of(2026, 6, 30);
            Exam exam = buildExam(EXAM_ID, classEntity);
            when(examRepository.findByClassEntityIdInAndExamDateBetween(List.of(CLASS_ID), start, end))
                    .thenReturn(List.of(exam));

            List<Exam> result = examService.getExamsInRange(USER_ID, start, end);

            assertEquals(1, result.size());
        }

        @Test
        void returnsEmptyWhenNoClassesAssigned() {
            authenticateAsStandardUser();
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            List<Exam> result = examService.getExamsInRange(USER_ID,
                    LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

            assertTrue(result.isEmpty());
            verify(examRepository, never()).findByClassEntityIdInAndExamDateBetween(any(), any(), any());
        }
    }
}
