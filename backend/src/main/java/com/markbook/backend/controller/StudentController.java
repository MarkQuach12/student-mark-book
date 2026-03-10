package com.markbook.backend.controller;

import com.markbook.backend.dto.StudentDTO;
import com.markbook.backend.dto.request.CreateStudentRequest;
import com.markbook.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/classes/{classId}/students")
    public List<StudentDTO> getStudents(@PathVariable UUID classId) {
        return studentService.getStudentsByClassId(classId).stream()
                .map(StudentDTO::from)
                .toList();
    }

    @PostMapping("/classes/{classId}/students")
    public StudentDTO addStudent(@PathVariable UUID classId,
                                 @RequestBody @Valid CreateStudentRequest body) {
        return StudentDTO.from(studentService.addStudent(classId, body.name()));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id,
                                              @RequestHeader("X-User-Id") String userId) {
        studentService.deleteStudent(id, userId);
        return ResponseEntity.noContent().build();
    }
}
