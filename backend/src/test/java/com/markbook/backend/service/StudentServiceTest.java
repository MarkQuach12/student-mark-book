package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Student;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.HomeworkCompletionRepository;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private ClassRepository classRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private HomeworkCompletionRepository homeworkCompletionRepository;

    @Mock
    private ClassService classService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private StudentService studentService;

    private static final String USER_ID = "user-123";
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();

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
        return c;
    }

    private Student buildStudent(UUID studentId, ClassEntity classEntity) {
        Student student = new Student();
        student.setId(studentId);
        student.setClassEntity(classEntity);
        student.setName("John Doe");
        return student;
    }

    // -------------------------------------------------------
    // getStudentsByClassId
    // -------------------------------------------------------
    @Nested
    class GetStudentsByClassId {

        @Test
        void returnsAllStudentsForAClass() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student s1 = buildStudent(UUID.randomUUID(), classEntity);
            Student s2 = buildStudent(UUID.randomUUID(), classEntity);
            s2.setName("Jane Smith");
            when(studentRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of(s1, s2));

            List<Student> result = studentService.getStudentsByClassId(CLASS_ID);

            assertEquals(2, result.size());
            verify(studentRepository).findByClassEntityId(CLASS_ID);
        }

        @Test
        void returnsEmptyListForClassWithNoStudents() {
            when(studentRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of());

            List<Student> result = studentService.getStudentsByClassId(CLASS_ID);

            assertTrue(result.isEmpty());
            verify(studentRepository).findByClassEntityId(CLASS_ID);
        }
    }

    // -------------------------------------------------------
    // addStudent
    // -------------------------------------------------------
    @Nested
    class AddStudent {

        @Test
        void createsStudentAndSeedsPaymentRecords() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(studentRepository.save(any(Student.class))).thenAnswer(inv -> {
                Student s = inv.getArgument(0);
                s.setId(STUDENT_ID);
                return s;
            });

            Student result = studentService.addStudent(CLASS_ID, "John Doe");

            assertEquals("John Doe", result.getName());
            assertEquals(CLASS_ID, result.getClassEntity().getId());
            verify(studentRepository).save(any(Student.class));
            verify(paymentService).seedPaymentsForNewStudent(result);
        }

        @Test
        void throwsWhenClassNotFound() {
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> studentService.addStudent(CLASS_ID, "Ghost Student"));
        }
    }

    // -------------------------------------------------------
    // deleteStudent
    // -------------------------------------------------------
    @Nested
    class DeleteStudent {

        @Test
        void adminVerifiesAccessThenDeletesStudentAndCascadingRecords() {
            authenticateAsAdmin();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student student = buildStudent(STUDENT_ID, classEntity);
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            doNothing().when(classService).verifyClassAccess(USER_ID, CLASS_ID);

            studentService.deleteStudent(STUDENT_ID, USER_ID);

            verify(classService).verifyClassAccess(USER_ID, CLASS_ID);
            verify(attendanceRepository).deleteByStudentId(STUDENT_ID);
            verify(paymentRepository).deleteByStudentId(STUDENT_ID);
            verify(homeworkCompletionRepository).deleteByStudentId(STUDENT_ID);
            verify(studentRepository).delete(student);
        }

        @Test
        void standardUserWithAccessCanDelete() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student student = buildStudent(STUDENT_ID, classEntity);
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            doNothing().when(classService).verifyClassAccess(USER_ID, CLASS_ID);

            studentService.deleteStudent(STUDENT_ID, USER_ID);

            verify(classService).verifyClassAccess(USER_ID, CLASS_ID);
            verify(attendanceRepository).deleteByStudentId(STUDENT_ID);
            verify(paymentRepository).deleteByStudentId(STUDENT_ID);
            verify(homeworkCompletionRepository).deleteByStudentId(STUDENT_ID);
            verify(studentRepository).delete(student);
        }

        @Test
        void throwsWhenStudentNotFound() {
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> studentService.deleteStudent(STUDENT_ID, USER_ID));
        }

        @Test
        void standardUserWithoutAccessGetsForbidden() {
            authenticateAsStandardUser();
            ClassEntity classEntity = buildClass(CLASS_ID);
            Student student = buildStudent(STUDENT_ID, classEntity);
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN))
                    .when(classService).verifyClassAccess(USER_ID, CLASS_ID);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> studentService.deleteStudent(STUDENT_ID, USER_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(studentRepository, never()).delete(any());
        }
    }
}
