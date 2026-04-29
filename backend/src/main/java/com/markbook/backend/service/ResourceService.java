package com.markbook.backend.service;

import com.markbook.backend.dto.ResourceDTO;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Resource;
import com.markbook.backend.model.Topic;
import com.markbook.backend.repository.ResourceRepository;
import com.markbook.backend.repository.TopicRepository;
import com.markbook.backend.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;

    public ResourceService(ResourceRepository resourceRepository,
                           TopicRepository topicRepository) {
        this.resourceRepository = resourceRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional(readOnly = true)
    public List<ResourceDTO> getResourcesForTopic(UUID topicId) {
        return resourceRepository.findByTopicIdOrderBySortOrder(topicId).stream()
                .map(ResourceDTO::from).toList();
    }

    @Transactional
    public ResourceDTO createResource(UUID topicId, String title, String url) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can add resources");
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        String trimmedTitle = title.trim();
        if (resourceRepository.existsByTopicIdAndTitleIgnoreCase(topicId, trimmedTitle)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A resource with this name already exists in this topic.");
        }

        Resource resource = new Resource();
        resource.setTopic(topic);
        resource.setTitle(trimmedTitle);
        resource.setDriveUrl(url.trim());
        // fileType inference disabled: most Drive share links don't expose extensions.
        // inferFileType() remains for future re-use if we ever wire up Drive API metadata.

        Resource saved = resourceRepository.save(resource);
        log.info("Resource created id={} topicId={} title={}", saved.getId(), topicId, title);
        return ResourceDTO.from(saved);
    }

    static String inferFileType(String url) {
        if (url == null) return null;
        String lower = url.toLowerCase();

        if (lower.contains("docs.google.com/document/")) return "gdoc";
        if (lower.contains("docs.google.com/presentation/")) return "gslides";
        if (lower.contains("docs.google.com/spreadsheets/")) return "gsheet";

        int q = lower.indexOf('?');
        if (q >= 0) lower = lower.substring(0, q);
        int h = lower.indexOf('#');
        if (h >= 0) lower = lower.substring(0, h);

        int dot = lower.lastIndexOf('.');
        if (dot < 0 || dot == lower.length() - 1) return null;
        String ext = lower.substring(dot + 1);

        return switch (ext) {
            case "pdf" -> "pdf";
            case "doc", "docx" -> ext;
            case "ppt", "pptx" -> "pptx";
            case "xls", "xlsx" -> "xlsx";
            case "png", "jpg", "jpeg" -> ext;
            default -> null;
        };
    }

    @Transactional
    public void deleteResource(UUID resourceId) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete resources");
        }
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        log.warn("Deleting resource id={} title={}", resourceId, resource.getTitle());
        resourceRepository.delete(resource);
    }
}
