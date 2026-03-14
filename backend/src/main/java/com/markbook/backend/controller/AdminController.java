package com.markbook.backend.controller;

import com.markbook.backend.dto.ClassDTO;
import com.markbook.backend.dto.UserDTO;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.User;
import com.markbook.backend.model.UserClassAssignment;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.UserClassAssignmentRepository;
import com.markbook.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final UserClassAssignmentRepository assignmentRepository;

    public AdminController(UserRepository userRepository,
                           ClassRepository classRepository,
                           UserClassAssignmentRepository assignmentRepository) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.assignmentRepository = assignmentRepository;
    }

    @GetMapping("/users")
    public List<UserDTO> listUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::from)
                .toList();
    }

    @GetMapping("/users/{userId}/classes")
    public List<ClassDTO> getUserClasses(@PathVariable String userId) {
        return assignmentRepository.findByUserId(userId).stream()
                .map(a -> ClassDTO.from(a.getClassEntity()))
                .toList();
    }

    @PostMapping("/users/{userId}/classes/{classId}")
    public ResponseEntity<Void> assignClass(@PathVariable String userId,
                                            @PathVariable UUID classId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        if (assignmentRepository.existsByUserIdAndClassEntityId(userId, classId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already assigned to this class");
        }

        UserClassAssignment assignment = new UserClassAssignment();
        assignment.setUser(user);
        assignment.setClassEntity(classEntity);
        assignmentRepository.save(assignment);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/users/{userId}/classes/{classId}")
    public ResponseEntity<Void> unassignClass(@PathVariable String userId,
                                              @PathVariable UUID classId) {
        if (!assignmentRepository.existsByUserIdAndClassEntityId(userId, classId)) {
            throw new ResourceNotFoundException("Assignment not found");
        }
        assignmentRepository.deleteByUserIdAndClassEntityId(userId, classId);
        return ResponseEntity.noContent().build();
    }
}
