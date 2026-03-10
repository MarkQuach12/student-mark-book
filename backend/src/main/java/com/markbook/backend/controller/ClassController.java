package com.markbook.backend.controller;

import com.markbook.backend.dto.ClassDTO;
import com.markbook.backend.dto.ClassOverviewDTO;
import com.markbook.backend.dto.request.CreateClassRequest;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    public List<ClassDTO> getClasses(@RequestHeader("X-User-Id") String userId) {
        return classService.getClassesForUser(userId).stream()
                .map(ClassDTO::from)
                .toList();
    }

    @PostMapping
    public ClassDTO createClass(@RequestHeader("X-User-Id") String userId,
                                @RequestBody @Valid CreateClassRequest body) {
        ClassEntity created = classService.createClass(
                userId,
                body.classLevel(),
                body.dayOfWeek(),
                LocalTime.parse(body.startTime()),
                LocalTime.parse(body.endTime())
        );

        return ClassDTO.from(created);
    }

    @GetMapping("/{id}/overview")
    public ClassOverviewDTO getClassOverview(@PathVariable UUID id,
                                             @RequestHeader("X-User-Id") String userId) {
        return classService.getClassOverview(id, userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable UUID id,
                                            @RequestHeader("X-User-Id") String userId) {
        classService.deleteClass(id, userId);
        return ResponseEntity.noContent().build();
    }
}
