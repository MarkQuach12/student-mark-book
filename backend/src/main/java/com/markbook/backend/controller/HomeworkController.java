package com.markbook.backend.controller;

import com.markbook.backend.dto.HomeworkCompletionDTO;
import com.markbook.backend.dto.HomeworkDTO;
import com.markbook.backend.dto.request.CreateHomeworkRequest;
import com.markbook.backend.dto.request.ToggleCompletionRequest;
import com.markbook.backend.model.Homework;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ClassService;
import com.markbook.backend.service.HomeworkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class HomeworkController {

    private final HomeworkService homeworkService;
    private final ClassService classService;

    public HomeworkController(HomeworkService homeworkService, ClassService classService) {
        this.homeworkService = homeworkService;
        this.classService = classService;
    }

    @GetMapping("/classes/{classId}/homework")
    public List<HomeworkDTO> getHomework(@PathVariable UUID classId,
                                         @RequestParam(required = false) String termKey,
                                         @RequestParam(required = false) Short weekIndex) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        List<Homework> homework;
        if (termKey != null && weekIndex != null) {
            homework = homeworkService.getHomeworkByClassIdAndWeek(classId, termKey, weekIndex);
        } else {
            homework = homeworkService.getHomeworkByClassId(classId);
        }
        return homework.stream().map(HomeworkDTO::from).toList();
    }

    @PostMapping("/classes/{classId}/homework")
    public HomeworkDTO createHomework(@PathVariable UUID classId,
                                     @RequestBody @Valid CreateHomeworkRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return HomeworkDTO.from(homeworkService.createHomework(
                classId,
                body.title(),
                body.termKey(),
                body.weekIndex()
        ));
    }

    @DeleteMapping("/homework/{id}")
    public ResponseEntity<Void> deleteHomework(@PathVariable UUID id) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.verifyClassAccessByHomeworkId(SecurityUtils.getCurrentUserId(), id);
        homeworkService.deleteHomework(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/classes/{classId}/completions")
    public List<HomeworkCompletionDTO> getCompletions(@PathVariable UUID classId) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return homeworkService.getCompletionsByClassId(classId).stream()
                .map(HomeworkCompletionDTO::from)
                .toList();
    }

    @PutMapping("/completions")
    public HomeworkCompletionDTO toggleCompletion(@RequestBody @Valid ToggleCompletionRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.verifyClassAccessByStudentId(SecurityUtils.getCurrentUserId(), body.studentId());
        return HomeworkCompletionDTO.from(homeworkService.toggleCompletion(
                body.studentId(),
                body.homeworkId()
        ));
    }
}
