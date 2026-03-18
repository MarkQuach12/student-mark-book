package com.markbook.backend.service;

import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock private ClassRepository classRepository;
    @Mock private UserClassAssignmentRepository assignmentRepository;
    @Mock private ExamRepository examRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private AttendanceRepository attendanceRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private HomeworkRepository homeworkRepository;
    @Mock private ExtraLessonRepository extraLessonRepository;
    @Mock private UserRepository userRepository;
    @Mock private TermRepository termRepository;

    private ChatService chatService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String USER_ID = "user@example.com";
    private static final UUID CLASS_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        chatService = new ChatService(classRepository, assignmentRepository, examRepository,
                paymentRepository, attendanceRepository, studentRepository, homeworkRepository,
                extraLessonRepository, userRepository, termRepository, objectMapper);
    }

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

    // -------------------------------------------------------
    // chat
    // -------------------------------------------------------
    @Nested
    class Chat {

        @Test
        void returnsErrorMessageWhenApiKeyNotConfigured() {
            ReflectionTestUtils.setField(chatService, "anthropicApiKey", "");

            String result = chatService.chat(USER_ID, "Hello");

            assertEquals("Chat is not configured. Please set the ANTHROPIC_API_KEY environment variable.", result);
        }

        @Test
        void returnsErrorMessageWhenApiKeyIsNull() {
            ReflectionTestUtils.setField(chatService, "anthropicApiKey", null);

            String result = chatService.chat(USER_ID, "Hello");

            assertEquals("Chat is not configured. Please set the ANTHROPIC_API_KEY environment variable.", result);
        }
    }

    // -------------------------------------------------------
    // buildUserContext (tested indirectly through chat behavior)
    // -------------------------------------------------------
    @Nested
    class BuildUserContext {

        @Test
        void includesUserInfoAndAccessibleClasses() {
            authenticateAsStandardUser();
            // Use reflection to call buildUserContext directly
            User user = new User(USER_ID, "John Doe", USER_ID);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

            ClassEntity classEntity = new ClassEntity();
            classEntity.setId(CLASS_ID);
            classEntity.setClassLevel("Year 10");
            classEntity.setDayOfWeek("Monday");
            classEntity.setStartTime(java.time.LocalTime.of(9, 0));
            classEntity.setEndTime(java.time.LocalTime.of(10, 0));

            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));
            when(classRepository.findAllById(List.of(CLASS_ID))).thenReturn(List.of(classEntity));
            when(studentRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of());
            when(paymentRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of());
            when(attendanceRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of());
            when(homeworkRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of());
            when(termRepository.findAllWithWeeks()).thenReturn(List.of());
            when(examRepository.findByClassEntityIdIn(List.of(CLASS_ID))).thenReturn(List.of());
            when(extraLessonRepository.findByClassEntityIdIn(List.of(CLASS_ID))).thenReturn(List.of());

            String context = ReflectionTestUtils.invokeMethod(chatService, "buildUserContext", USER_ID);

            assertNotNull(context);
            assertTrue(context.contains("John Doe"));
            assertTrue(context.contains("Year 10"));
            assertTrue(context.contains("Monday"));
        }

        @Test
        void adminContextIncludesAllClasses() {
            authenticateAsAdmin();
            User user = new User(USER_ID, "Admin", USER_ID);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

            ClassEntity c1 = new ClassEntity();
            c1.setId(CLASS_ID);
            c1.setClassLevel("Year 10");
            c1.setDayOfWeek("Monday");
            c1.setStartTime(java.time.LocalTime.of(9, 0));
            c1.setEndTime(java.time.LocalTime.of(10, 0));

            UUID c2Id = UUID.randomUUID();
            ClassEntity c2 = new ClassEntity();
            c2.setId(c2Id);
            c2.setClassLevel("Year 11");
            c2.setDayOfWeek("Tuesday");
            c2.setStartTime(java.time.LocalTime.of(11, 0));
            c2.setEndTime(java.time.LocalTime.of(12, 0));

            when(classRepository.findAll()).thenReturn(List.of(c1, c2));
            when(studentRepository.findByClassEntityId(any())).thenReturn(List.of());
            when(paymentRepository.findByClassIdWithFetch(any())).thenReturn(List.of());
            when(attendanceRepository.findByClassIdWithFetch(any())).thenReturn(List.of());
            when(homeworkRepository.findByClassIdWithFetch(any())).thenReturn(List.of());
            when(termRepository.findAllWithWeeks()).thenReturn(List.of());
            when(examRepository.findByClassEntityIdIn(any())).thenReturn(List.of());
            when(extraLessonRepository.findByClassEntityIdIn(any())).thenReturn(List.of());

            String context = ReflectionTestUtils.invokeMethod(chatService, "buildUserContext", USER_ID);

            assertNotNull(context);
            assertTrue(context.contains("Year 10"));
            assertTrue(context.contains("Year 11"));
            verify(assignmentRepository, never()).findByUserId(any());
        }

        @Test
        void includesStudentsPaymentsAndAttendanceForEachClass() {
            authenticateAsStandardUser();
            User user = new User(USER_ID, "Teacher", USER_ID);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));

            ClassEntity classEntity = new ClassEntity();
            classEntity.setId(CLASS_ID);
            classEntity.setClassLevel("Year 10");
            classEntity.setDayOfWeek("Monday");
            classEntity.setStartTime(java.time.LocalTime.of(9, 0));
            classEntity.setEndTime(java.time.LocalTime.of(10, 0));

            UserClassAssignment assignment = new UserClassAssignment();
            assignment.setClassEntity(classEntity);
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of(assignment));
            when(classRepository.findAllById(List.of(CLASS_ID))).thenReturn(List.of(classEntity));

            Student student = new Student();
            student.setId(UUID.randomUUID());
            student.setName("Alice");
            student.setClassEntity(classEntity);
            when(studentRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of(student));

            Term term = new Term();
            term.setKey("term1");
            term.setLabel("Term 1");
            term.setWeeks(List.of());

            Payment payment = new Payment();
            payment.setStudent(student);
            payment.setTerm(term);
            payment.setWeekIndex((short) 1);
            payment.setStatus("paid");
            when(paymentRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(payment));

            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setTerm(term);
            attendance.setWeekIndex((short) 1);
            attendance.setPresent(true);
            when(attendanceRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(attendance));

            when(homeworkRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of());
            when(termRepository.findAllWithWeeks()).thenReturn(List.of(term));
            when(examRepository.findByClassEntityIdIn(List.of(CLASS_ID))).thenReturn(List.of());
            when(extraLessonRepository.findByClassEntityIdIn(List.of(CLASS_ID))).thenReturn(List.of());

            String context = ReflectionTestUtils.invokeMethod(chatService, "buildUserContext", USER_ID);

            assertNotNull(context);
            assertTrue(context.contains("Alice"));
            assertTrue(context.contains("paid"));
            assertTrue(context.contains("present"));
        }

        @Test
        void handlesUserWithNoClasses() {
            authenticateAsStandardUser();
            User user = new User(USER_ID, "New Teacher", USER_ID);
            when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            String context = ReflectionTestUtils.invokeMethod(chatService, "buildUserContext", USER_ID);

            assertNotNull(context);
            assertTrue(context.contains("no classes assigned"));
        }

        @Test
        void includesTodaysDate() {
            authenticateAsStandardUser();
            when(userRepository.findById(USER_ID)).thenReturn(Optional.empty());
            when(assignmentRepository.findByUserId(USER_ID)).thenReturn(List.of());

            String context = ReflectionTestUtils.invokeMethod(chatService, "buildUserContext", USER_ID);

            assertNotNull(context);
            assertTrue(context.contains("Today's date:"));
        }
    }
}
