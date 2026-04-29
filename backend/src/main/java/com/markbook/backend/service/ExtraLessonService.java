package com.markbook.backend.service;

import com.markbook.backend.dto.ExtraLessonDTO;
import com.markbook.backend.dto.request.CreateExtraLessonRequest;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.ExtraLesson;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ExtraLessonRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import com.markbook.backend.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ExtraLessonService {

    private final ExtraLessonRepository extraLessonRepository;
    private final ClassRepository classRepository;
    private final UserClassAssignmentRepository assignmentRepository;

    public ExtraLessonService(ExtraLessonRepository extraLessonRepository,
                              ClassRepository classRepository,
                              UserClassAssignmentRepository assignmentRepository) {
        this.extraLessonRepository = extraLessonRepository;
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

    @Transactional
    public ExtraLessonDTO createExtraLesson(CreateExtraLessonRequest request) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create extra lessons");
        }

        UUID classId = UUID.fromString(request.classId());
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        LocalDate lessonDate = LocalDate.parse(request.lessonDate());
        if (lessonDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson date cannot be in the past.");
        }

        ExtraLesson lesson = new ExtraLesson();
        lesson.setClassEntity(classEntity);
        lesson.setTitle(request.title());
        lesson.setLessonDate(lessonDate);
        lesson.setStartTime(LocalTime.parse(request.startTime()));
        lesson.setEndTime(LocalTime.parse(request.endTime()));

        ExtraLesson saved = extraLessonRepository.save(lesson);
        log.info("Extra lesson created id={} classId={}", saved.getId(), classId);
        return ExtraLessonDTO.from(saved);
    }

    @Transactional
    public void deleteExtraLesson(UUID id) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete extra lessons");
        }

        ExtraLesson lesson = extraLessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Extra lesson not found"));
        log.warn("Deleting extra lesson id={}", id);
        extraLessonRepository.delete(lesson);
    }

    @Transactional(readOnly = true)
    public List<ExtraLessonDTO> getExtraLessonsForUser(String userId, LocalDate start, LocalDate end) {
        List<UUID> classIds = getAccessibleClassIds(userId);
        if (classIds.isEmpty()) return List.of();

        List<ExtraLesson> lessons;
        if (start != null && end != null) {
            lessons = extraLessonRepository.findByClassEntityIdInAndLessonDateBetween(classIds, start, end);
        } else {
            lessons = extraLessonRepository.findByClassEntityIdIn(classIds);
        }
        return lessons.stream().map(ExtraLessonDTO::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ExtraLessonDTO> getExtraLessonsForClass(UUID classId) {
        return extraLessonRepository.findByClassEntityId(classId).stream()
                .map(ExtraLessonDTO::from)
                .toList();
    }
}
