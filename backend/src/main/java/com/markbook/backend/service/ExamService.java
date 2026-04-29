package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Exam;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ExamRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import com.markbook.backend.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ClassRepository classRepository;
    private final UserClassAssignmentRepository assignmentRepository;

    public ExamService(ExamRepository examRepository,
                       ClassRepository classRepository,
                       UserClassAssignmentRepository assignmentRepository) {
        this.examRepository = examRepository;
        this.classRepository = classRepository;
        this.assignmentRepository = assignmentRepository;
    }

    private List<UUID> getAccessibleClassIds(String userId) {
        if (SecurityUtils.isAdmin()) {
            return classRepository.findAll().stream().map(ClassEntity::getId).toList();
        }
        return assignmentRepository.findByUserId(userId).stream()
                .map(a -> a.getClassEntity().getId())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsForUser(String userId) {
        List<UUID> classIds = getAccessibleClassIds(userId);
        if (classIds.isEmpty()) return List.of();
        return examRepository.findByClassEntityIdIn(classIds);
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsInRange(String userId, LocalDate start, LocalDate end) {
        List<UUID> classIds = getAccessibleClassIds(userId);
        if (classIds.isEmpty()) return List.of();
        return examRepository.findByClassEntityIdInAndExamDateBetween(classIds, start, end);
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsForClass(UUID classId) {
        return examRepository.findByClassEntityId(classId);
    }

    @Transactional
    public Exam createExam(String userId, UUID classId, String title, LocalDate examDate) {
        log.info("Creating exam for classId={} title={} date={}", classId, title, examDate);

        if (examDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exam date cannot be in the past.");
        }

        // Verify access
        if (!SecurityUtils.isAdmin() && !assignmentRepository.existsByUserIdAndClassEntityId(userId, classId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        Exam exam = new Exam();
        exam.setClassEntity(classEntity);
        exam.setTitle(title);
        exam.setExamDate(examDate);

        Exam saved = examRepository.save(exam);
        log.debug("Exam created id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteExam(UUID id, String userId) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        UUID classId = exam.getClassEntity().getId();
        if (!SecurityUtils.isAdmin() && !assignmentRepository.existsByUserIdAndClassEntityId(userId, classId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        log.warn("Deleting exam id={} by userId={}", id, userId);
        examRepository.delete(exam);
    }
}
