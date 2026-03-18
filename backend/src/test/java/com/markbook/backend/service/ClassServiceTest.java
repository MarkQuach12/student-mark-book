package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Homework;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.User;
import com.markbook.backend.model.UserClassAssignment;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ClassTopicVisibilityRepository;
import com.markbook.backend.repository.ExamRepository;
import com.markbook.backend.repository.ExtraLessonRepository;
import com.markbook.backend.repository.HomeworkCompletionRepository;
import com.markbook.backend.repository.HomeworkRepository;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import com.markbook.backend.repository.UserRepository;
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

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClassServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private HomeworkCompletionRepository completionRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private TermRepository termRepository;

    @Mock
    private UserClassAssignmentRepository assignmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExtraLessonRepository extraLessonRepository;

    @Mock
    private ClassTopicVisibilityRepository classTopicVisibilityRepository;

    @Mock
    private TopicService topicService;

    @Mock
    private ExtraLessonService extraLessonService;

    @InjectMocks
    private ClassService classService;

    private static final String USER_ID = "user-123";
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();
    private static final UUID HOMEWORK_ID = UUID.randomUUID();

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
        c.setStartTime(LocalTime.of(9, 0));
        c.setEndTime(LocalTime.of(10, 0));
        return c;
    }

    private Student buildStudent(UUID studentId, ClassEntity classEntity) {
        Student student = new Student();
        student.setId(studentId);
        student.setClassEntity(classEntity);
        return student;
    }

    private Homework buildHomework(UUID homeworkId, ClassEntity classEntity) {
        Homework homework = new Homework();
        homework.setId(homeworkId);
        homework.setClassEntity(classEntity);
        return homework;
    }

    // -------------------------------------------------------
    // verifyClassAccess
    // -------------------------------------------------------
    @Nested
    class VerifyClassAccess {

        @Test
        void adminBypassesAssignmentCheck() {
            authenticateAsAdmin();

            classService.verifyClassAccess(USER_ID, CLASS_ID);

            verify(assignmentRepository, never()).existsByUserIdAndClassEntityId(any(), any());
        }

        @Test
        void standardUserWithAssignmentDoesNotThrow() {
            authenticateAsStandardUser();
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(true);

            assertDoesNotThrow(() -> classService.verifyClassAccess(USER_ID, CLASS_ID));
        }

        @Test
        void standardUserWithoutAssignmentThrows403() {
            authenticateAsStandardUser();
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> classService.verifyClassAccess(USER_ID, CLASS_ID));

            assertEquals(403, ex.getStatusCode().value());
        }

        @Test
        void throwsWhenClassNotFoundViaStudentAccess() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student student = buildStudent(STUDENT_ID, classEntity);
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(assignmentRepository.existsByUserIdAndClassEntityId(USER_ID, CLASS_ID)).thenReturn(false);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> classService.verifyClassAccessByStudentId(USER_ID, STUDENT_ID));

            assertEquals(403, ex.getStatusCode().value());
        }
    }

    // -------------------------------------------------------
    // verifyClassAccessByStudentId
    // -------------------------------------------------------
    @Nested
    class VerifyClassAccessByStudentId {

        @Test
        void adminResolvesStudentAndBypassesCheck() {
            authenticateAsAdmin();

            classService.verifyClassAccessByStudentId(USER_ID, STUDENT_ID);

            verify(studentRepository, never()).findById(any());
            verify(assignmentRepository, never()).existsByUserIdAndClassEntityId(any(), any());
        }

        @Test
        void throwsWhenStudentNotFound() {
            authenticateAsStandardUser();
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> classService.verifyClassAccessByStudentId(USER_ID, STUDENT_ID));
        }
    }

    // -------------------------------------------------------
    // verifyClassAccessByHomeworkId
    // -------------------------------------------------------
    @Nested
    class VerifyClassAccessByHomeworkId {

        @Test
        void adminResolvesHomeworkAndBypassesCheck() {
            authenticateAsAdmin();

            classService.verifyClassAccessByHomeworkId(USER_ID, HOMEWORK_ID);

            verify(homeworkRepository, never()).findById(any());
            verify(assignmentRepository, never()).existsByUserIdAndClassEntityId(any(), any());
        }

        @Test
        void throwsWhenHomeworkNotFound() {
            authenticateAsStandardUser();
            when(homeworkRepository.findById(HOMEWORK_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> classService.verifyClassAccessByHomeworkId(USER_ID, HOMEWORK_ID));
        }
    }

    // -------------------------------------------------------
    // getClassesForUser
    // -------------------------------------------------------
    @Nested
    class GetClassesForUser {

        @Test
        void adminSeesAllClasses() {
            authenticateAsAdmin();
            ClassEntity c1 = buildClass(CLASS_ID);
            UUID classId2 = UUID.randomUUID();
            ClassEntity c2 = buildClass(classId2);
            when(classRepository.findAll()).thenReturn(List.of(c1, c2));

            List<ClassEntity> result = classService.getClassesForUser(USER_ID);

            assertEquals(2, result.size());
            verify(assignmentRepository, never()).findByUserId(any());
        }

        @Test
        void standardUserSeesOnlyAssignedClasses() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));

            List<ClassEntity> result = classService.getClassesForUser(USER_ID);

            assertEquals(1, result.size());
            assertEquals(CLASS_ID, result.get(0).getId());
        }

        @Test
        void returnsEmptyListWhenUserHasNoAssignments() {
            authenticateAsStandardUser();
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            List<ClassEntity> result = classService.getClassesForUser(USER_ID);

            assertTrue(result.isEmpty());
        }
    }

    // -------------------------------------------------------
    // getClassById
    // -------------------------------------------------------
    @Nested
    class GetClassById {

        @Test
        void returnsClassWhenFound() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));

            ClassEntity result = classService.getClassById(CLASS_ID);

            assertEquals(CLASS_ID, result.getId());
            assertEquals("Year 10", result.getClassLevel());
        }

        @Test
        void throwsWhenClassNotFound() {
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> classService.getClassById(CLASS_ID));
        }
    }

    // -------------------------------------------------------
    // createClass
    // -------------------------------------------------------
    @Nested
    class CreateClass {

        @Test
        void adminCanCreateClass() {
            authenticateAsAdmin();
            User user = new User(USER_ID, "Test User", "test@example.com");
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(classRepository.save(any(ClassEntity.class))).thenAnswer(inv -> {
                ClassEntity c = inv.getArgument(0);
                c.setId(CLASS_ID);
                return c;
            });

            ClassEntity result = classService.createClass(USER_ID, "Year 10", "Monday",
                    LocalTime.of(9, 0), LocalTime.of(10, 0), "Room A");

            assertEquals("Year 10", result.getClassLevel());
            assertEquals("Monday", result.getDayOfWeek());
            assertEquals("Room A", result.getLabel());
            verify(classRepository).save(any(ClassEntity.class));
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> classService.createClass(USER_ID, "Year 10", "Monday",
                            LocalTime.of(9, 0), LocalTime.of(10, 0), "Room A"));

            assertEquals(403, ex.getStatusCode().value());
            verify(classRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------
    // deleteClass
    // -------------------------------------------------------
    @Nested
    class DeleteClass {

        @Test
        void adminCanDeleteWithCascadingDeletes() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student s1 = buildStudent(UUID.randomUUID(), classEntity);
            Student s2 = buildStudent(UUID.randomUUID(), classEntity);
            classEntity.setStudents(List.of(s1, s2));
            when(classRepository.findByIdWithStudents(CLASS_ID)).thenReturn(Optional.of(classEntity));

            classService.deleteClass(CLASS_ID, USER_ID);

            // Verify student-level deletes
            verify(attendanceRepository).deleteByStudentId(s1.getId());
            verify(attendanceRepository).deleteByStudentId(s2.getId());
            verify(paymentRepository).deleteByStudentId(s1.getId());
            verify(paymentRepository).deleteByStudentId(s2.getId());
            verify(completionRepository).deleteByStudentId(s1.getId());
            verify(completionRepository).deleteByStudentId(s2.getId());

            // Verify class-level deletes
            verify(examRepository).deleteByClassEntityId(CLASS_ID);
            verify(extraLessonRepository).deleteByClassEntityId(CLASS_ID);
            verify(classTopicVisibilityRepository).deleteByClassEntityId(CLASS_ID);
            verify(assignmentRepository).deleteByClassEntityId(CLASS_ID);

            // Verify class itself deleted
            verify(classRepository).delete(classEntity);
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            classEntity.setStudents(List.of());
            when(classRepository.findByIdWithStudents(CLASS_ID)).thenReturn(Optional.of(classEntity));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> classService.deleteClass(CLASS_ID, USER_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(classRepository, never()).delete(any());
        }

        @Test
        void throwsWhenClassNotFound() {
            authenticateAsAdmin();
            when(classRepository.findByIdWithStudents(CLASS_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> classService.deleteClass(CLASS_ID, USER_ID));
        }
    }
}
