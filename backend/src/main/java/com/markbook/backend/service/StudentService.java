package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Student;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.StudentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    public StudentService(StudentRepository studentRepository, ClassRepository classRepository) {
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
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

        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(UUID id, String userId) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (!student.getClassEntity().getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        log.warn("Deleting student id={}", id);
        studentRepository.delete(student);
    }
}
