package com.markbook.backend.controller;

import com.markbook.backend.dto.StudentDTO;
import com.markbook.backend.dto.request.CreateStudentRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ClassService;
import com.markbook.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService studentService;
    private final ClassService classService;

    public StudentController(StudentService studentService, ClassService classService) {
        this.studentService = studentService;
        this.classService = classService;
    }

    @GetMapping("/classes/{classId}/students")
    public List<StudentDTO> getStudents(@PathVariable UUID classId) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return studentService.getStudentsByClassId(classId).stream()
                .map(StudentDTO::from)
                .toList();
    }

    @PostMapping("/classes/{classId}/students")
    public StudentDTO addStudent(@PathVariable UUID classId,
                                 @RequestBody @Valid CreateStudentRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return StudentDTO.from(studentService.addStudent(classId, body.name()));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        studentService.deleteStudent(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
