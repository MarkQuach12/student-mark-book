package com.markbook.backend.controller;

import com.markbook.backend.dto.ClassDTO;
import com.markbook.backend.dto.ClassOverviewDTO;
import com.markbook.backend.dto.request.CreateClassRequest;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
    public List<ClassDTO> getClasses() {
        return classService.getClassesForUser(SecurityUtils.getCurrentUserId()).stream()
                .map(ClassDTO::from)
                .toList();
    }

    @PostMapping
    public ClassDTO createClass(@RequestBody @Valid CreateClassRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        ClassEntity created = classService.createClass(
                SecurityUtils.getCurrentUserId(),
                body.classLevel(),
                body.dayOfWeek(),
                LocalTime.parse(body.startTime()),
                LocalTime.parse(body.endTime())
        );
        return ClassDTO.from(created);
    }

    @GetMapping("/{id}/overview")
    public ClassOverviewDTO getClassOverview(@PathVariable UUID id) {
        return classService.getClassOverview(id, SecurityUtils.getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable UUID id) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.deleteClass(id, SecurityUtils.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }
}
