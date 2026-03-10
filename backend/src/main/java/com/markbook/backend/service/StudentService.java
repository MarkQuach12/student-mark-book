package com.markbook.backend.service;

import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.Student;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

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

    public Student addStudent(UUID classId, String name) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Student student = new Student();
        student.setClassEntity(classEntity);
        student.setName(name);

        return studentRepository.save(student);
    }

    public void deleteStudent(UUID id) {
        studentRepository.deleteById(id);
    }
}
