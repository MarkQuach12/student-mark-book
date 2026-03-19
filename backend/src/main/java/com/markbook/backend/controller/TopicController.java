package com.markbook.backend.controller;

import com.markbook.backend.dto.TopicDTO;
import com.markbook.backend.dto.request.CreateTopicRequest;
import com.markbook.backend.dto.request.UpdateTopicRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ClassService;
import com.markbook.backend.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;
    private final ClassService classService;

    public TopicController(TopicService topicService, ClassService classService) {
        this.topicService = topicService;
        this.classService = classService;
    }

    @GetMapping
    public List<TopicDTO> getTopics(@RequestParam UUID classId, @RequestParam String classLevel) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return topicService.getTopicsForClass(classId, classLevel);
    }

    @PostMapping
    public TopicDTO createTopic(@RequestBody @Valid CreateTopicRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return topicService.createTopic(body.classLevel(), body.name());
    }

    @PutMapping("/{topicId}")
    public TopicDTO updateTopic(@PathVariable UUID topicId, @RequestBody UpdateTopicRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return topicService.updateTopic(topicId, body.name(), body.sortOrder());
    }

    @PutMapping("/{topicId}/visibility")
    public TopicDTO toggleVisibility(@PathVariable UUID topicId, @RequestParam UUID classId) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return topicService.toggleVisibility(classId, topicId);
    }

    @DeleteMapping("/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID topicId) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        topicService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }
}
