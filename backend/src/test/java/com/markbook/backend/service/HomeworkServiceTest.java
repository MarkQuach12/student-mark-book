package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
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
class HomeworkServiceTest {

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private HomeworkCompletionRepository completionRepository;

    @Mock
    private ClassRepository classRepository;

    @Mock
    private TermRepository termRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private HomeworkService homeworkService;

    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID HOMEWORK_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();
    private static final String TERM_KEY = "term1";
    private static final Short WEEK_INDEX = (short) 3;

    private ClassEntity buildClass(UUID id) {
        ClassEntity c = new ClassEntity();
        c.setId(id);
        return c;
    }

    private Term buildTerm(String key) {
        Term t = new Term();
        t.setKey(key);
        t.setLabel("Term 1");
        return t;
    }

    private Homework buildHomework(UUID id, ClassEntity classEntity) {
        Homework hw = new Homework();
        hw.setId(id);
        hw.setClassEntity(classEntity);
        hw.setTitle("Math Worksheet");
        hw.setTerm(buildTerm(TERM_KEY));
        hw.setWeekIndex(WEEK_INDEX);
        return hw;
    }

    private Student buildStudent(UUID id) {
        Student s = new Student();
        s.setId(id);
        s.setName("John Doe");
        return s;
    }

    private HomeworkCompletion buildCompletion(UUID id, Student student, Homework homework, boolean completed) {
        HomeworkCompletion hc = new HomeworkCompletion();
        hc.setId(id);
        hc.setStudent(student);
        hc.setHomework(homework);
        hc.setCompleted(completed);
        return hc;
    }

    // -------------------------------------------------------
    // getHomeworkByClassId
    // -------------------------------------------------------
    @Nested
    class GetHomeworkByClassId {

        @Test
        void returnsAllHomeworkForClass() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw1 = buildHomework(UUID.randomUUID(), classEntity);
            Homework hw2 = buildHomework(UUID.randomUUID(), classEntity);
            when(homeworkRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(hw1, hw2));

            List<Homework> result = homeworkService.getHomeworkByClassId(CLASS_ID);

            assertEquals(2, result.size());
            verify(homeworkRepository).findByClassIdWithFetch(CLASS_ID);
        }
    }

    // -------------------------------------------------------
    // getHomeworkByClassIdAndWeek
    // -------------------------------------------------------
    @Nested
    class GetHomeworkByClassIdAndWeek {

        @Test
        void returnsHomeworkFilteredByTermAndWeek() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);
            when(homeworkRepository.findByClassEntityIdAndTermKeyAndWeekIndex(CLASS_ID, TERM_KEY, WEEK_INDEX))
                    .thenReturn(List.of(hw));

            List<Homework> result = homeworkService.getHomeworkByClassIdAndWeek(CLASS_ID, TERM_KEY, WEEK_INDEX);

            assertEquals(1, result.size());
            assertEquals("Math Worksheet", result.get(0).getTitle());
            verify(homeworkRepository).findByClassEntityIdAndTermKeyAndWeekIndex(CLASS_ID, TERM_KEY, WEEK_INDEX);
        }

        @Test
        void returnsEmptyWhenNoHomeworkForThatWeek() {
            when(homeworkRepository.findByClassEntityIdAndTermKeyAndWeekIndex(CLASS_ID, TERM_KEY, (short) 9))
                    .thenReturn(List.of());

            List<Homework> result = homeworkService.getHomeworkByClassIdAndWeek(CLASS_ID, TERM_KEY, (short) 9);

            assertTrue(result.isEmpty());
        }
    }

    // -------------------------------------------------------
    // createHomework
    // -------------------------------------------------------
    @Nested
    class CreateHomework {

        @Test
        void createsHomeworkWithCorrectTermAndWeekIndex() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Term term = buildTerm(TERM_KEY);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(termRepository.findById(TERM_KEY)).thenReturn(Optional.of(term));
            when(homeworkRepository.save(any(Homework.class))).thenAnswer(inv -> {
                Homework hw = inv.getArgument(0);
                hw.setId(HOMEWORK_ID);
                return hw;
            });

            Homework result = homeworkService.createHomework(CLASS_ID, "Algebra Practice", TERM_KEY, WEEK_INDEX);

            assertEquals("Algebra Practice", result.getTitle());
            assertEquals(CLASS_ID, result.getClassEntity().getId());
            assertEquals(TERM_KEY, result.getTerm().getKey());
            assertEquals(WEEK_INDEX, result.getWeekIndex());

            ArgumentCaptor<Homework> captor = ArgumentCaptor.forClass(Homework.class);
            verify(homeworkRepository).save(captor.capture());
            Homework saved = captor.getValue();
            assertEquals("Algebra Practice", saved.getTitle());
            assertEquals(classEntity, saved.getClassEntity());
            assertEquals(term, saved.getTerm());
            assertEquals(WEEK_INDEX, saved.getWeekIndex());
        }

        @Test
        void throwsWhenClassNotFound() {
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> homeworkService.createHomework(CLASS_ID, "Ghost HW", TERM_KEY, WEEK_INDEX));
        }

        @Test
        void throwsWhenTermNotFound() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(termRepository.findById(TERM_KEY)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> homeworkService.createHomework(CLASS_ID, "Ghost HW", TERM_KEY, WEEK_INDEX));
        }
    }

    // -------------------------------------------------------
    // deleteHomework
    // -------------------------------------------------------
    @Nested
    class DeleteHomework {

        @Test
        void deletesHomeworkById() {
            homeworkService.deleteHomework(HOMEWORK_ID);

            verify(homeworkRepository).deleteById(HOMEWORK_ID);
        }
    }

    // -------------------------------------------------------
    // getCompletionsByClassId
    // -------------------------------------------------------
    @Nested
    class GetCompletionsByClassId {

        @Test
        void returnsAllCompletionRecordsForClass() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);
            Student student = buildStudent(STUDENT_ID);
            HomeworkCompletion hc = buildCompletion(UUID.randomUUID(), student, hw, true);
            when(completionRepository.findByClassIdWithFetch(CLASS_ID)).thenReturn(List.of(hc));

            List<HomeworkCompletion> result = homeworkService.getCompletionsByClassId(CLASS_ID);

            assertEquals(1, result.size());
            verify(completionRepository).findByClassIdWithFetch(CLASS_ID);
        }
    }

    // -------------------------------------------------------
    // toggleCompletion
    // -------------------------------------------------------
    @Nested
    class ToggleCompletion {

        @Test
        void togglesExistingCompletionFromTrueToFalse() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);
            Student student = buildStudent(STUDENT_ID);
            HomeworkCompletion existing = buildCompletion(UUID.randomUUID(), student, hw, true);

            when(completionRepository.findByStudentIdAndHomeworkId(STUDENT_ID, HOMEWORK_ID))
                    .thenReturn(Optional.of(existing));
            when(completionRepository.save(any(HomeworkCompletion.class))).thenAnswer(inv -> inv.getArgument(0));

            HomeworkCompletion result = homeworkService.toggleCompletion(STUDENT_ID, HOMEWORK_ID);

            assertFalse(result.getCompleted());
            verify(completionRepository).save(existing);
        }

        @Test
        void togglesExistingCompletionFromFalseToTrue() {
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);
            Student student = buildStudent(STUDENT_ID);
            HomeworkCompletion existing = buildCompletion(UUID.randomUUID(), student, hw, false);

            when(completionRepository.findByStudentIdAndHomeworkId(STUDENT_ID, HOMEWORK_ID))
                    .thenReturn(Optional.of(existing));
            when(completionRepository.save(any(HomeworkCompletion.class))).thenAnswer(inv -> inv.getArgument(0));

            HomeworkCompletion result = homeworkService.toggleCompletion(STUDENT_ID, HOMEWORK_ID);

            assertTrue(result.getCompleted());
            verify(completionRepository).save(existing);
        }

        @Test
        void createsNewCompletionRecordWhenNoneExists() {
            Student student = buildStudent(STUDENT_ID);
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);

            when(completionRepository.findByStudentIdAndHomeworkId(STUDENT_ID, HOMEWORK_ID))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(homeworkRepository.findById(HOMEWORK_ID)).thenReturn(Optional.of(hw));
            when(completionRepository.save(any(HomeworkCompletion.class))).thenAnswer(inv -> inv.getArgument(0));

            HomeworkCompletion result = homeworkService.toggleCompletion(STUDENT_ID, HOMEWORK_ID);

            assertTrue(result.getCompleted());
            verify(completionRepository).save(any(HomeworkCompletion.class));
        }

        @Test
        void verifiesCorrectStudentAndHomeworkIdsOnNewCompletion() {
            Student student = buildStudent(STUDENT_ID);
            ClassEntity classEntity = buildClass(CLASS_ID);
            Homework hw = buildHomework(HOMEWORK_ID, classEntity);

            when(completionRepository.findByStudentIdAndHomeworkId(STUDENT_ID, HOMEWORK_ID))
                    .thenReturn(Optional.empty());
            when(studentRepository.findById(STUDENT_ID)).thenReturn(Optional.of(student));
            when(homeworkRepository.findById(HOMEWORK_ID)).thenReturn(Optional.of(hw));
            when(completionRepository.save(any(HomeworkCompletion.class))).thenAnswer(inv -> inv.getArgument(0));

            homeworkService.toggleCompletion(STUDENT_ID, HOMEWORK_ID);

            ArgumentCaptor<HomeworkCompletion> captor = ArgumentCaptor.forClass(HomeworkCompletion.class);
            verify(completionRepository).save(captor.capture());
            HomeworkCompletion saved = captor.getValue();
            assertEquals(STUDENT_ID, saved.getStudent().getId());
            assertEquals(HOMEWORK_ID, saved.getHomework().getId());
            assertTrue(saved.getCompleted());
        }
    }
}
