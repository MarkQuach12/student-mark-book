package com.markbook.backend.service;

import com.markbook.backend.dto.*;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.*;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.HomeworkCompletionRepository;
import com.markbook.backend.repository.HomeworkRepository;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.TermRepository;
import com.markbook.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkCompletionRepository completionRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final TermRepository termRepository;

    public ClassService(ClassRepository classRepository,
                        UserRepository userRepository,
                        HomeworkRepository homeworkRepository,
                        HomeworkCompletionRepository completionRepository,
                        AttendanceRepository attendanceRepository,
                        PaymentRepository paymentRepository,
                        TermRepository termRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.homeworkRepository = homeworkRepository;
        this.completionRepository = completionRepository;
        this.attendanceRepository = attendanceRepository;
        this.paymentRepository = paymentRepository;
        this.termRepository = termRepository;
    }

    @Transactional(readOnly = true)
    public List<ClassEntity> getClassesForUser(String userId) {
        return classRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public ClassEntity getClassById(UUID id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    @Transactional
    public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        log.info("Creating class for userId={} level={} day={}", userId, classLevel, dayOfWeek);

        User user = userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = new User(userId, userId, userId);
                    return userRepository.save(newUser);
                });

        ClassEntity classEntity = new ClassEntity();
        classEntity.setUser(user);
        classEntity.setClassLevel(classLevel);
        classEntity.setDayOfWeek(dayOfWeek);
        classEntity.setStartTime(startTime);
        classEntity.setEndTime(endTime);

        ClassEntity saved = classRepository.save(classEntity);
        log.debug("Class created id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteClass(UUID id, String userId) {
        ClassEntity cls = classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        if (!cls.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        log.warn("Deleting class id={} by userId={}", id, userId);
        classRepository.delete(cls);
    }

    @Transactional(readOnly = true)
    public ClassOverviewDTO getClassOverview(UUID classId, String userId) {
        log.debug("Loading overview for classId={}", classId);
        ClassEntity classEntity = classRepository.findByIdWithStudents(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        if (!classEntity.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        ClassDTO classInfo = ClassDTO.from(classEntity);
        List<StudentDTO> students = classEntity.getStudents().stream().map(StudentDTO::from).toList();
        List<HomeworkDTO> homework = homeworkRepository.findByClassIdWithFetch(classId).stream().map(HomeworkDTO::from).toList();
        List<AttendanceDTO> attendance = attendanceRepository.findByClassIdWithFetch(classId).stream().map(AttendanceDTO::from).toList();
        List<HomeworkCompletionDTO> completions = completionRepository.findByClassIdWithFetch(classId).stream().map(HomeworkCompletionDTO::from).toList();
        List<PaymentDTO> payments = paymentRepository.findByClassIdWithFetch(classId).stream().map(PaymentDTO::from).toList();
        // Load terms in this transaction so weeks are initialized; avoid cached detached entities from TermService
        List<TermDTO> terms = termRepository.findAllWithWeeks().stream().map(TermDTO::from).toList();

        return new ClassOverviewDTO(classInfo, students, homework, attendance, completions, payments, terms);
    }
}
