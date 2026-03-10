package com.markbook.backend.service;

import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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

    public Homework createHomework(UUID classId, String title, String termKey, Short weekIndex) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        Term term = termRepository.findById(termKey)
                .orElseThrow(() -> new RuntimeException("Term not found"));

        Homework homework = new Homework();
        homework.setClassEntity(classEntity);
        homework.setTitle(title);
        homework.setTerm(term);
        homework.setWeekIndex(weekIndex);

        return homeworkRepository.save(homework);
    }

    public void deleteHomework(UUID id) {
        homeworkRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<HomeworkCompletion> getCompletionsByClassId(UUID classId) {
        return completionRepository.findByClassIdWithFetch(classId);
    }

    public HomeworkCompletion toggleCompletion(UUID studentId, UUID homeworkId) {
        return completionRepository.findByStudentIdAndHomeworkId(studentId, homeworkId)
                .map(existing -> {
                    existing.setCompleted(!existing.getCompleted());
                    return completionRepository.save(existing);
                })
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));
                    Homework homework = homeworkRepository.findById(homeworkId)
                            .orElseThrow(() -> new RuntimeException("Homework not found"));

                    HomeworkCompletion completion = new HomeworkCompletion();
                    completion.setStudent(student);
                    completion.setHomework(homework);
                    completion.setCompleted(true);
                    return completionRepository.save(completion);
                });
    }
}
