package com.markbook.backend.controller;

import com.markbook.backend.dto.TopicDTO;
import com.markbook.backend.dto.request.CreateTopicRequest;
import com.markbook.backend.dto.request.UpdateTopicRequest;
import com.markbook.backend.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public List<TopicDTO> getTopics(@RequestParam UUID classId, @RequestParam String classLevel) {
        return topicService.getTopicsForClass(classId, classLevel);
    }

    @PostMapping
    public TopicDTO createTopic(@RequestBody @Valid CreateTopicRequest body) {
        return topicService.createTopic(body.classLevel(), body.name());
    }

    @PutMapping("/{topicId}")
    public TopicDTO updateTopic(@PathVariable UUID topicId, @RequestBody UpdateTopicRequest body) {
        return topicService.updateTopic(topicId, body.name(), body.sortOrder());
    }

    @PutMapping("/{topicId}/visibility")
    public TopicDTO toggleVisibility(@PathVariable UUID topicId, @RequestParam UUID classId) {
        return topicService.toggleVisibility(classId, topicId);
    }

    @DeleteMapping("/{topicId}")
    public ResponseEntity<Void> deleteTopic(@PathVariable UUID topicId) {
        topicService.deleteTopic(topicId);
        return ResponseEntity.noContent().build();
    }
}
