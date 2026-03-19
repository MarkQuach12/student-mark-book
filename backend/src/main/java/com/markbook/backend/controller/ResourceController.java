package com.markbook.backend.controller;

import com.markbook.backend.dto.ResourceDTO;
import com.markbook.backend.dto.request.CreateResourceRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/topics/{topicId}/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public List<ResourceDTO> getResources(@PathVariable UUID topicId) {
        return resourceService.getResourcesForTopic(topicId);
    }

    @PostMapping
    public ResourceDTO createResource(@PathVariable UUID topicId, @RequestBody @Valid CreateResourceRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return resourceService.createResource(topicId, body.title(), body.driveUrl());
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable UUID topicId, @PathVariable UUID resourceId) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        resourceService.deleteResource(resourceId);
        return ResponseEntity.noContent().build();
    }
}
