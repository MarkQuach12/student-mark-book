package com.markbook.backend.controller;

import com.markbook.backend.model.Homework;
import com.markbook.backend.model.HomeworkCompletion;
import com.markbook.backend.service.HomeworkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class HomeworkController {

    private final HomeworkService homeworkService;

    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @GetMapping("/classes/{classId}/homework")
    public List<Map<String, Object>> getHomework(@PathVariable UUID classId,
                                                  @RequestParam(required = false) String termKey,
                                                  @RequestParam(required = false) Short weekIndex) {
        List<Homework> homework;
        if (termKey != null && weekIndex != null) {
            homework = homeworkService.getHomeworkByClassIdAndWeek(classId, termKey, weekIndex);
        } else {
            homework = homeworkService.getHomeworkByClassId(classId);
        }

        return homework.stream()
                .map(h -> Map.<String, Object>of(
                        "id", h.getId(),
                        "title", h.getTitle(),
                        "termKey", h.getTerm().getKey(),
                        "weekIndex", h.getWeekIndex()
                ))
                .toList();
    }

    @PostMapping("/classes/{classId}/homework")
    public Map<String, Object> createHomework(@PathVariable UUID classId,
                                              @RequestBody Map<String, Object> body) {
        Homework homework = homeworkService.createHomework(
                classId,
                (String) body.get("title"),
                (String) body.get("termKey"),
                ((Number) body.get("weekIndex")).shortValue()
        );

        return Map.of(
                "id", homework.getId(),
                "title", homework.getTitle(),
                "termKey", homework.getTerm().getKey(),
                "weekIndex", homework.getWeekIndex()
        );
    }

    @DeleteMapping("/homework/{id}")
    public ResponseEntity<Void> deleteHomework(@PathVariable UUID id) {
        homeworkService.deleteHomework(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classes/{classId}/completions")
    public List<Map<String, Object>> getCompletions(@PathVariable UUID classId) {
        return homeworkService.getCompletionsByClassId(classId).stream()
                .map(c -> Map.<String, Object>of(
                        "studentId", c.getStudent().getId(),
                        "homeworkId", c.getHomework().getId(),
                        "completed", c.getCompleted()
                ))
                .toList();
    }

    @PutMapping("/completions")
    public Map<String, Object> toggleCompletion(@RequestBody Map<String, String> body) {
        HomeworkCompletion completion = homeworkService.toggleCompletion(
                UUID.fromString(body.get("studentId")),
                UUID.fromString(body.get("homeworkId"))
        );

        return Map.of(
                "studentId", completion.getStudent().getId(),
                "homeworkId", completion.getHomework().getId(),
                "completed", completion.getCompleted()
        );
    }
}
