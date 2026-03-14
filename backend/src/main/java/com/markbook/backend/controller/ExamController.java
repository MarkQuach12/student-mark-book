package com.markbook.backend.controller;

import com.markbook.backend.dto.ExamDTO;
import com.markbook.backend.dto.request.CreateExamRequest;
import com.markbook.backend.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public List<ExamDTO> getExams(@RequestHeader("X-User-Id") String userId,
                                  @RequestParam(required = false) String start,
                                  @RequestParam(required = false) String end) {
        if (start == null && end == null) {
            return examService.getExamsForUser(userId).stream().map(ExamDTO::from).toList();
        }

        if (start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both start and end are required together");
        }

        LocalDate parsedStart = LocalDate.parse(start);
        LocalDate parsedEnd = LocalDate.parse(end);
        if (parsedStart.isAfter(parsedEnd)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start must be before or equal to end");
        }

        return examService.getExamsInRange(userId, parsedStart, parsedEnd).stream().map(ExamDTO::from).toList();
    }

    @PostMapping
    public ExamDTO createExam(@RequestHeader("X-User-Id") String userId,
                              @RequestBody @Valid CreateExamRequest body) {
        return ExamDTO.from(examService.createExam(
                userId,
                body.title(),
                LocalDate.parse(body.examDate())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable UUID id,
                                           @RequestHeader("X-User-Id") String userId) {
        examService.deleteExam(id, userId);
        return ResponseEntity.noContent().build();
    }
}
