package com.markbook.backend.service;

import com.markbook.backend.dto.*;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.*;
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
import com.markbook.backend.security.SecurityUtils;
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
    private final UserClassAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final ExamRepository examRepository;
    private final ExtraLessonRepository extraLessonRepository;
    private final ClassTopicVisibilityRepository classTopicVisibilityRepository;
    private final TopicService topicService;
    private final ExtraLessonService extraLessonService;

    public ClassService(ClassRepository classRepository,
                        UserRepository userRepository,
                        HomeworkRepository homeworkRepository,
                        HomeworkCompletionRepository completionRepository,
                        AttendanceRepository attendanceRepository,
                        PaymentRepository paymentRepository,
                        TermRepository termRepository,
                        UserClassAssignmentRepository assignmentRepository,
                        StudentRepository studentRepository,
                        ExamRepository examRepository,
                        ExtraLessonRepository extraLessonRepository,
                        ClassTopicVisibilityRepository classTopicVisibilityRepository,
                        TopicService topicService,
                        ExtraLessonService extraLessonService) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.homeworkRepository = homeworkRepository;
        this.completionRepository = completionRepository;
        this.attendanceRepository = attendanceRepository;
        this.paymentRepository = paymentRepository;
        this.termRepository = termRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.examRepository = examRepository;
        this.extraLessonRepository = extraLessonRepository;
        this.classTopicVisibilityRepository = classTopicVisibilityRepository;
        this.topicService = topicService;
        this.extraLessonService = extraLessonService;
    }

    public void verifyClassAccess(String userId, UUID classId) {
        if (SecurityUtils.isAdmin()) return;
        if (!assignmentRepository.existsByUserIdAndClassEntityId(userId, classId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    @Transactional(readOnly = true)
    public void verifyClassAccessByStudentId(String userId, UUID studentId) {
        if (SecurityUtils.isAdmin()) return;
        com.markbook.backend.model.Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        verifyClassAccess(userId, student.getClassEntity().getId());
    }

    @Transactional(readOnly = true)
    public void verifyClassAccessByHomeworkId(String userId, UUID homeworkId) {
        if (SecurityUtils.isAdmin()) return;
        com.markbook.backend.model.Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));
        verifyClassAccess(userId, homework.getClassEntity().getId());
    }

    @Transactional(readOnly = true)
    public List<ClassEntity> getClassesForUser(String userId) {
        if (SecurityUtils.isAdmin()) {
            return classRepository.findAll();
        }
        return assignmentRepository.findByUserId(userId).stream()
                .map(UserClassAssignment::getClassEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClassEntity getClassById(UUID id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    @Transactional
    public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, LocalTime startTime, LocalTime endTime, String label) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create classes");
        }
        log.info("Creating class for userId={} level={} day={}", userId, classLevel, dayOfWeek);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ClassEntity classEntity = new ClassEntity();
        classEntity.setUser(user);
        classEntity.setClassLevel(classLevel);
        classEntity.setDayOfWeek(dayOfWeek);
        classEntity.setStartTime(startTime);
        classEntity.setEndTime(endTime);
        classEntity.setLabel(label);

        ClassEntity saved = classRepository.save(classEntity);
        log.debug("Class created id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteClass(UUID id, String userId) {
        ClassEntity cls = classRepository.findByIdWithStudents(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete classes");
        }
        log.warn("Deleting class id={} and all related records by userId={}", id, userId);

        // Delete student-level records first (attendance, payments, completions)
        if (cls.getStudents() != null) {
            for (Student student : cls.getStudents()) {
                attendanceRepository.deleteByStudentId(student.getId());
                paymentRepository.deleteByStudentId(student.getId());
                completionRepository.deleteByStudentId(student.getId());
            }
        }

        // Delete class-level records
        examRepository.deleteByClassEntityId(id);
        extraLessonRepository.deleteByClassEntityId(id);
        classTopicVisibilityRepository.deleteByClassEntityId(id);
        assignmentRepository.deleteByClassEntityId(id);

        // Delete class (cascades to students and homework)
        classRepository.delete(cls);
    }

    @Transactional(readOnly = true)
    public ClassOverviewDTO getClassOverview(UUID classId, String userId) {
        log.debug("Loading overview for classId={}", classId);
        ClassEntity classEntity = classRepository.findByIdWithStudents(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        verifyClassAccess(userId, classId);

        ClassDTO classInfo = ClassDTO.from(classEntity);
        List<StudentDTO> students = classEntity.getStudents().stream().map(StudentDTO::from).toList();
        List<HomeworkDTO> homework = homeworkRepository.findByClassIdWithFetch(classId).stream().map(HomeworkDTO::from).toList();
        List<AttendanceDTO> attendance = attendanceRepository.findByClassIdWithFetch(classId).stream().map(AttendanceDTO::from).toList();
        List<HomeworkCompletionDTO> completions = completionRepository.findByClassIdWithFetch(classId).stream().map(HomeworkCompletionDTO::from).toList();
        List<PaymentDTO> payments = paymentRepository.findByClassIdWithFetch(classId).stream().map(PaymentDTO::from).toList();
        List<TermDTO> terms = termRepository.findAllWithWeeks().stream().map(TermDTO::from).toList();
        List<ExamDTO> exams = examRepository.findByClassEntityId(classId).stream().map(ExamDTO::from).toList();
        List<TopicDTO> topics = topicService.getTopicsForClass(classId, classEntity.getClassLevel());
        List<ExtraLessonDTO> extraLessons = extraLessonService.getExtraLessonsForClass(classId);

        return new ClassOverviewDTO(classInfo, students, homework, attendance, completions, payments, terms, exams, topics, extraLessons);
    }
}
