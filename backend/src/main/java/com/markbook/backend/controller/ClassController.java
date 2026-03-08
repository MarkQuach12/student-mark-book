package com.markbook.backend.controller;

import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.service.ClassService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    public List<Map<String, Object>> getClasses(@RequestHeader("X-User-Id") String userId) {
        return classService.getClassesForUser(userId).stream()
                .map(c -> Map.<String, Object>of(
                        "id", c.getId(),
                        "classLevel", c.getClassLevel(),
                        "dayOfWeek", c.getDayOfWeek(),
                        "startTime", c.getStartTime().toString(),
                        "endTime", c.getEndTime().toString(),
                        "name", c.getName()
                ))
                .toList();
    }

    @PostMapping
    public Map<String, Object> createClass(@RequestHeader("X-User-Id") String userId,
                                           @RequestBody Map<String, String> body) {
        ClassEntity created = classService.createClass(
                userId,
                body.get("classLevel"),
                body.get("dayOfWeek"),
                LocalTime.parse(body.get("startTime")),
                LocalTime.parse(body.get("endTime"))
        );

        return Map.of(
                "id", created.getId(),
                "classLevel", created.getClassLevel(),
                "dayOfWeek", created.getDayOfWeek(),
                "startTime", created.getStartTime().toString(),
                "endTime", created.getEndTime().toString(),
                "name", created.getName()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable UUID id) {
        classService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}
