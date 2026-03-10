package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final HomeworkCompletionRepository completionRepository;
    private final ClassRepository classRepository;
    private final TermRepository termRepository;
    private final StudentRepository studentRepository;

    public HomeworkService(HomeworkRepository homeworkRepository,
                           HomeworkCompletionRepository completionRepository,
                           ClassRepository classRepository,
                           TermRepository termRepository,
                           StudentRepository studentRepository) {
        this.homeworkRepository = homeworkRepository;
        this.completionRepository = completionRepository;
        this.classRepository = classRepository;
        this.termRepository = termRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public List<Homework> getHomeworkByClassId(UUID classId) {
        return homeworkRepository.findByClassIdWithFetch(classId);
    }

    public List<Homework> getHomeworkByClassIdAndWeek(UUID classId, String termKey, Short weekIndex) {
        return homeworkRepository.findByClassEntityIdAndTermKeyAndWeekIndex(classId, termKey, weekIndex);
    }

    @Transactional
    public Homework createHomework(UUID classId, String title, String termKey, Short weekIndex) {
        log.info("Creating homework title='{}' for classId={} termKey={} weekIndex={}", title, classId, termKey, weekIndex);
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Term term = termRepository.findById(termKey)
                .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

        Homework homework = new Homework();
        homework.setClassEntity(classEntity);
        homework.setTitle(title);
        homework.setTerm(term);
        homework.setWeekIndex(weekIndex);

        return homeworkRepository.save(homework);
    }

    @Transactional
    public void deleteHomework(UUID id) {
        log.warn("Deleting homework id={}", id);
        homeworkRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<HomeworkCompletion> getCompletionsByClassId(UUID classId) {
        return completionRepository.findByClassIdWithFetch(classId);
    }

    @Transactional
    public HomeworkCompletion toggleCompletion(UUID studentId, UUID homeworkId) {
        return completionRepository.findByStudentIdAndHomeworkId(studentId, homeworkId)
                .map(existing -> {
                    log.debug("Toggling completion for studentId={} homeworkId={} to completed={}", studentId, homeworkId, !existing.getCompleted());
                    existing.setCompleted(!existing.getCompleted());
                    return completionRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.debug("Creating new completion for studentId={} homeworkId={}", studentId, homeworkId);
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    Homework homework = homeworkRepository.findById(homeworkId)
                            .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

                    HomeworkCompletion completion = new HomeworkCompletion();
                    completion.setStudent(student);
                    completion.setHomework(homework);
                    completion.setCompleted(true);
                    return completionRepository.save(completion);
                });
    }
}
