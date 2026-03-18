package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Student;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.HomeworkCompletionRepository;
import com.markbook.backend.repository.PaymentRepository;
import com.markbook.backend.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final HomeworkCompletionRepository homeworkCompletionRepository;
    private final ClassService classService;
    private final PaymentService paymentService;

    public StudentService(StudentRepository studentRepository, ClassRepository classRepository,
                          AttendanceRepository attendanceRepository, PaymentRepository paymentRepository,
                          HomeworkCompletionRepository homeworkCompletionRepository,
                          ClassService classService, PaymentService paymentService) {
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.attendanceRepository = attendanceRepository;
        this.paymentRepository = paymentRepository;
        this.homeworkCompletionRepository = homeworkCompletionRepository;
        this.classService = classService;
        this.paymentService = paymentService;
    }

    @Transactional(readOnly = true)
    public List<Student> getStudentsByClassId(UUID classId) {
        return studentRepository.findByClassEntityId(classId);
    }

    @Transactional
    public Student addStudent(UUID classId, String name) {
        log.info("Adding student name='{}' to classId={}", name, classId);
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        Student student = new Student();
        student.setClassEntity(classEntity);
        student.setName(name);
        student = studentRepository.save(student);

        // Seed unpaid payment records from current week onward
        paymentService.seedPaymentsForNewStudent(student);

        return student;
    }

    @Transactional
    public void deleteStudent(UUID id, String userId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        classService.verifyClassAccess(userId, student.getClassEntity().getId());
        log.warn("Deleting student id={} and all related records", id);
        attendanceRepository.deleteByStudentId(id);
        paymentRepository.deleteByStudentId(id);
        homeworkCompletionRepository.deleteByStudentId(id);
        studentRepository.delete(student);
    }
}
