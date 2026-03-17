package com.markbook.backend.controller;

import com.markbook.backend.dto.ExtraLessonDTO;
import com.markbook.backend.dto.request.CreateExtraLessonRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ExtraLessonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/extra-lessons")
public class ExtraLessonController {

    private final ExtraLessonService extraLessonService;

    public ExtraLessonController(ExtraLessonService extraLessonService) {
        this.extraLessonService = extraLessonService;
    }

    @GetMapping
    public List<ExtraLessonDTO> getExtraLessons(@RequestParam(required = false) String start,
                                                 @RequestParam(required = false) String end) {
        String userId = SecurityUtils.getCurrentUserId();
        LocalDate parsedStart = null;
        LocalDate parsedEnd = null;

        if (start != null && end != null) {
            parsedStart = LocalDate.parse(start);
            parsedEnd = LocalDate.parse(end);
            if (parsedStart.isAfter(parsedEnd)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start must be before or equal to end");
            }
        } else if (start != null || end != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both start and end are required together");
        }

        return extraLessonService.getExtraLessonsForUser(userId, parsedStart, parsedEnd);
    }

    @PostMapping
    public ExtraLessonDTO createExtraLesson(@RequestBody @Valid CreateExtraLessonRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return extraLessonService.createExtraLesson(body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExtraLesson(@PathVariable UUID id) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        extraLessonService.deleteExtraLesson(id);
        return ResponseEntity.noContent().build();
    }
}
