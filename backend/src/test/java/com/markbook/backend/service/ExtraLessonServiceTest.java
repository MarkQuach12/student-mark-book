package com.markbook.backend.service;

import com.markbook.backend.dto.ExtraLessonDTO;
import com.markbook.backend.dto.request.CreateExtraLessonRequest;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.ExtraLesson;
import com.markbook.backend.model.UserClassAssignment;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ExtraLessonRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExtraLessonServiceTest {

    @Mock private ExtraLessonRepository extraLessonRepository;
    @Mock private ClassRepository classRepository;
    @Mock private UserClassAssignmentRepository assignmentRepository;

    @InjectMocks
    private ExtraLessonService extraLessonService;

    private static final String USER_ID = "user-123";
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID LESSON_ID = UUID.randomUUID();

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

    private ExtraLesson buildExtraLesson(UUID id, ClassEntity classEntity) {
        ExtraLesson lesson = new ExtraLesson();
        lesson.setId(id);
        lesson.setClassEntity(classEntity);
        lesson.setTitle("Extra Math");
        lesson.setLessonDate(LocalDate.of(2026, 4, 1));
        lesson.setStartTime(LocalTime.of(10, 0));
        lesson.setEndTime(LocalTime.of(11, 30));
        return lesson;
    }

    // -------------------------------------------------------
    // createExtraLesson
    // -------------------------------------------------------
    @Nested
    class CreateExtraLesson {

        @Test
        void adminCreatesExtraLessonWithParsedDatesTimes() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(extraLessonRepository.save(any(ExtraLesson.class))).thenAnswer(inv -> {
                ExtraLesson l = inv.getArgument(0);
                l.setId(LESSON_ID);
                return l;
            });

            CreateExtraLessonRequest request = new CreateExtraLessonRequest(
                    CLASS_ID.toString(), "Extra Math", "2026-04-01", "10:00", "11:30");

            ExtraLessonDTO result = extraLessonService.createExtraLesson(request);

            assertEquals("Extra Math", result.title());
            assertEquals("2026-04-01", result.lessonDate());
            assertEquals("10:00", result.startTime());
            assertEquals("11:30", result.endTime());
            verify(extraLessonRepository).save(any(ExtraLesson.class));
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            CreateExtraLessonRequest request = new CreateExtraLessonRequest(
                    CLASS_ID.toString(), "Extra Math", "2026-04-01", "10:00", "11:30");

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> extraLessonService.createExtraLesson(request));

            assertEquals(403, ex.getStatusCode().value());
            verify(extraLessonRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------
    // deleteExtraLesson
    // -------------------------------------------------------
    @Nested
    class DeleteExtraLesson {

        @Test
        void adminDeletesExtraLesson() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            ExtraLesson lesson = buildExtraLesson(LESSON_ID, classEntity);
            when(extraLessonRepository.findById(LESSON_ID)).thenReturn(Optional.of(lesson));

            extraLessonService.deleteExtraLesson(LESSON_ID);

            verify(extraLessonRepository).delete(lesson);
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> extraLessonService.deleteExtraLesson(LESSON_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(extraLessonRepository, never()).delete(any());
        }
    }

    // -------------------------------------------------------
    // getExtraLessonsForUser
    // -------------------------------------------------------
    @Nested
    class GetExtraLessonsForUser {

        @Test
        void returnsExtraLessonsForUserAccessibleClasses() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));

            ExtraLesson lesson = buildExtraLesson(LESSON_ID, classEntity);
            when(extraLessonRepository.findByClassEntityIdIn(List.of(CLASS_ID)))
                    .thenReturn(List.of(lesson));

            List<ExtraLessonDTO> result = extraLessonService.getExtraLessonsForUser(USER_ID, null, null);

            assertEquals(1, result.size());
            assertEquals("Extra Math", result.get(0).title());
        }

        @Test
        void filtersByDateRangeWhenProvided() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));

            LocalDate start = LocalDate.of(2026, 4, 1);
            LocalDate end = LocalDate.of(2026, 4, 30);
            ExtraLesson lesson = buildExtraLesson(LESSON_ID, classEntity);
            when(extraLessonRepository.findByClassEntityIdInAndLessonDateBetween(
                    List.of(CLASS_ID), start, end)).thenReturn(List.of(lesson));

            List<ExtraLessonDTO> result = extraLessonService.getExtraLessonsForUser(USER_ID, start, end);

            assertEquals(1, result.size());
            verify(extraLessonRepository).findByClassEntityIdInAndLessonDateBetween(
                    List.of(CLASS_ID), start, end);
        }

        @Test
        void adminSeesExtraLessonsFromAllClasses() {
            authenticateAsAdmin();
            ClassEntity c1 = buildClass(CLASS_ID);
            UUID c2Id = UUID.randomUUID();
            ClassEntity c2 = buildClass(c2Id);
            when(classRepository.findAll()).thenReturn(List.of(c1, c2));

            ExtraLesson l1 = buildExtraLesson(LESSON_ID, c1);
            ExtraLesson l2 = buildExtraLesson(UUID.randomUUID(), c2);
            when(extraLessonRepository.findByClassEntityIdIn(List.of(CLASS_ID, c2Id)))
                    .thenReturn(List.of(l1, l2));

            List<ExtraLessonDTO> result = extraLessonService.getExtraLessonsForUser(USER_ID, null, null);

            assertEquals(2, result.size());
            verify(assignmentRepository, never()).findByUserId(any());
        }

        @Test
        void returnsEmptyWhenNoClassesAssigned() {
            authenticateAsStandardUser();
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            List<ExtraLessonDTO> result = extraLessonService.getExtraLessonsForUser(USER_ID, null, null);

            assertTrue(result.isEmpty());
            verify(extraLessonRepository, never()).findByClassEntityIdIn(any());
        }
    }

    // -------------------------------------------------------
    // getExtraLessonsForClass
    // -------------------------------------------------------
    @Nested
    class GetExtraLessonsForClass {

        @Test
        void returnsExtraLessonsForSpecificClass() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            ExtraLesson lesson = buildExtraLesson(LESSON_ID, classEntity);
            when(extraLessonRepository.findByClassEntityId(CLASS_ID))
                    .thenReturn(List.of(lesson));

            List<ExtraLessonDTO> result = extraLessonService.getExtraLessonsForClass(CLASS_ID);

            assertEquals(1, result.size());
            assertEquals("Extra Math", result.get(0).title());
        }
    }
}
