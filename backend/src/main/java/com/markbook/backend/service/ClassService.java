package com.markbook.backend.service;

import com.markbook.backend.dto.ClassOverviewDTO;
import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkCompletionRepository completionRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final TermRepository termRepository;

    public ClassService(ClassRepository classRepository,
                        UserRepository userRepository,
                        StudentRepository studentRepository,
                        HomeworkRepository homeworkRepository,
                        HomeworkCompletionRepository completionRepository,
                        AttendanceRepository attendanceRepository,
                        PaymentRepository paymentRepository,
                        TermRepository termRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
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
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
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

        return classRepository.save(classEntity);
    }

    public void deleteClass(UUID id) {
        classRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ClassOverviewDTO getClassOverview(UUID classId) {
        // Query 1: class + students in one query (JOIN FETCH)
        ClassEntity classEntity = classRepository.findByIdWithStudents(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Map<String, Object> classInfo = new HashMap<>();
        classInfo.put("id", classEntity.getId());
        classInfo.put("classLevel", classEntity.getClassLevel());
        classInfo.put("dayOfWeek", classEntity.getDayOfWeek());
        classInfo.put("startTime", classEntity.getStartTime().toString());
        classInfo.put("endTime", classEntity.getEndTime().toString());
        classInfo.put("name", classEntity.getName());

        List<Map<String, Object>> students = classEntity.getStudents().stream()
                .map(s -> Map.<String, Object>of("id", s.getId(), "name", s.getName()))
                .toList();

        // Fire remaining 4 queries in parallel
        CompletableFuture<List<Homework>> hwFuture = CompletableFuture.supplyAsync(
                () -> homeworkRepository.findByClassIdWithFetch(classId));
        CompletableFuture<List<Attendance>> attFuture = CompletableFuture.supplyAsync(
                () -> attendanceRepository.findByClassIdWithFetch(classId));
        CompletableFuture<List<HomeworkCompletion>> compFuture = CompletableFuture.supplyAsync(
                () -> completionRepository.findByClassIdWithFetch(classId));
        CompletableFuture<List<Payment>> payFuture = CompletableFuture.supplyAsync(
                () -> paymentRepository.findByClassIdWithFetch(classId));
        CompletableFuture<List<Term>> termFuture = CompletableFuture.supplyAsync(
                () -> termRepository.findAllWithWeeks());

        // Wait for all to complete
        CompletableFuture.allOf(hwFuture, attFuture, compFuture, payFuture, termFuture).join();

        List<Map<String, Object>> homework = hwFuture.join().stream()
                .map(h -> Map.<String, Object>of(
                        "id", h.getId(),
                        "title", h.getTitle(),
                        "termKey", h.getTerm().getKey(),
                        "weekIndex", h.getWeekIndex()))
                .toList();

        List<Map<String, Object>> attendance = attFuture.join().stream()
                .map(a -> Map.<String, Object>of(
                        "studentId", a.getStudent().getId(),
                        "termKey", a.getTerm().getKey(),
                        "weekIndex", a.getWeekIndex(),
                        "present", a.getPresent()))
                .toList();

        List<Map<String, Object>> completions = compFuture.join().stream()
                .map(c -> Map.<String, Object>of(
                        "studentId", c.getStudent().getId(),
                        "homeworkId", c.getHomework().getId(),
                        "completed", c.getCompleted()))
                .toList();

        List<Map<String, Object>> payments = payFuture.join().stream()
                .map(p -> Map.<String, Object>of(
                        "studentId", p.getStudent().getId(),
                        "termKey", p.getTerm().getKey(),
                        "weekIndex", p.getWeekIndex(),
                        "status", p.getStatus()))
                .toList();

        List<Map<String, Object>> terms = termFuture.join().stream()
                .map(t -> Map.<String, Object>of(
                        "key", t.getKey(),
                        "label", t.getLabel(),
                        "weeks", t.getWeeks().stream()
                                .map(w -> Map.<String, Object>of(
                                        "weekIndex", w.getWeekIndex(),
                                        "label", w.getLabel(),
                                        "dateRange", w.getDateRange()))
                                .toList()))
                .toList();

        return new ClassOverviewDTO(classInfo, students, homework, attendance, completions, payments, terms);
    }
}
