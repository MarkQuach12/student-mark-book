package com.markbook.backend.controller;

import com.markbook.backend.dto.HomeworkCompletionDTO;
import com.markbook.backend.dto.HomeworkDTO;
import com.markbook.backend.dto.request.CreateHomeworkRequest;
import com.markbook.backend.dto.request.ToggleCompletionRequest;
import com.markbook.backend.model.Homework;
import com.markbook.backend.service.HomeworkService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class HomeworkController {

    private final HomeworkService homeworkService;

    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @GetMapping("/classes/{classId}/homework")
    public List<HomeworkDTO> getHomework(@PathVariable UUID classId,
                                         @RequestParam(required = false) String termKey,
                                         @RequestParam(required = false) Short weekIndex) {
        List<Homework> homework;
        if (termKey != null && weekIndex != null) {
            homework = homeworkService.getHomeworkByClassIdAndWeek(classId, termKey, weekIndex);
        } else {
            homework = homeworkService.getHomeworkByClassId(classId);
        }

        return homework.stream()
                .map(HomeworkDTO::from)
                .toList();
    }

    @PostMapping("/classes/{classId}/homework")
    public HomeworkDTO createHomework(@PathVariable UUID classId,
                                     @RequestBody @Valid CreateHomeworkRequest body) {
        return HomeworkDTO.from(homeworkService.createHomework(
                classId,
                body.title(),
                body.termKey(),
                body.weekIndex()
        ));
    }

    @DeleteMapping("/homework/{id}")
    public ResponseEntity<Void> deleteHomework(@PathVariable UUID id) {
        homeworkService.deleteHomework(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classes/{classId}/completions")
    public List<HomeworkCompletionDTO> getCompletions(@PathVariable UUID classId) {
        return homeworkService.getCompletionsByClassId(classId).stream()
                .map(HomeworkCompletionDTO::from)
                .toList();
    }

    @PutMapping("/completions")
    public HomeworkCompletionDTO toggleCompletion(@RequestBody @Valid ToggleCompletionRequest body) {
        return HomeworkCompletionDTO.from(homeworkService.toggleCompletion(
                body.studentId(),
                body.homeworkId()
        ));
    }
}
