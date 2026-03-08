package com.markbook.backend.controller;

import com.markbook.backend.model.Student;
import com.markbook.backend.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/classes/{classId}/students")
    public List<Map<String, Object>> getStudents(@PathVariable UUID classId) {
        return studentService.getStudentsByClassId(classId).stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "name", s.getName()
                ))
                .toList();
    }

    @PostMapping("/classes/{classId}/students")
    public Map<String, Object> addStudent(@PathVariable UUID classId,
                                          @RequestBody Map<String, String> body) {
        Student student = studentService.addStudent(classId, body.get("name"));
        return Map.of(
                "id", student.getId(),
                "name", student.getName()
        );
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
