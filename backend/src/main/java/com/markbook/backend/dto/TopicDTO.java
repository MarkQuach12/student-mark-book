package com.markbook.backend.dto;

import com.markbook.backend.model.Topic;

import java.util.List;
import java.util.UUID;

public record TopicDTO(UUID id, String name, boolean visible, int sortOrder, List<ResourceDTO> resources) {
    public static TopicDTO from(Topic t, boolean visible) {
        List<ResourceDTO> resources = t.getResources().stream().map(ResourceDTO::from).toList();
        return new TopicDTO(t.getId(), t.getName(), visible, t.getSortOrder(), resources);
    }
}
