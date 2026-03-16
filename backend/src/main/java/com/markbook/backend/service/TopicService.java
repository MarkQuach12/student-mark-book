package com.markbook.backend.service;

import com.markbook.backend.dto.TopicDTO;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.ClassTopicVisibility;
import com.markbook.backend.model.Topic;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ClassTopicVisibilityRepository;
import com.markbook.backend.repository.TopicRepository;
import com.markbook.backend.security.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final ClassRepository classRepository;
    private final ClassTopicVisibilityRepository visibilityRepository;

    public TopicService(TopicRepository topicRepository,
                        ClassRepository classRepository,
                        ClassTopicVisibilityRepository visibilityRepository) {
        this.topicRepository = topicRepository;
        this.classRepository = classRepository;
        this.visibilityRepository = visibilityRepository;
    }

    @Transactional(readOnly = true)
    public List<TopicDTO> getTopicsForClass(UUID classId, String classLevel) {
        List<Topic> topics = topicRepository.findByClassLevelWithResources(classLevel);
        Map<UUID, Boolean> visMap = visibilityRepository.findByClassEntityId(classId).stream()
                .collect(Collectors.toMap(v -> v.getTopic().getId(), ClassTopicVisibility::getVisible));

        if (SecurityUtils.isAdmin()) {
            return topics.stream()
                    .map(t -> TopicDTO.from(t, visMap.getOrDefault(t.getId(), false)))
                    .toList();
        } else {
            return topics.stream()
                    .filter(t -> visMap.getOrDefault(t.getId(), false))
                    .map(t -> TopicDTO.from(t, true))
                    .toList();
        }
    }

    @Transactional
    public TopicDTO createTopic(String classLevel, String name) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create topics");
        }

        Topic topic = new Topic();
        topic.setClassLevel(classLevel);
        topic.setName(name);

        Topic saved = topicRepository.save(topic);
        log.info("Topic created id={} classLevel={} name={}", saved.getId(), classLevel, name);
        return TopicDTO.from(saved, false);
    }

    @Transactional
    public TopicDTO toggleVisibility(UUID classId, UUID topicId) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can toggle visibility");
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

        ClassTopicVisibility vis = visibilityRepository.findByClassEntityIdAndTopicId(classId, topicId)
                .orElseGet(() -> {
                    ClassTopicVisibility v = new ClassTopicVisibility();
                    v.setClassEntity(classEntity);
                    v.setTopic(topic);
                    v.setVisible(false);
                    return v;
                });
        vis.setVisible(!vis.getVisible());
        visibilityRepository.save(vis);

        log.info("Topic visibility toggled topicId={} classId={} visible={}", topicId, classId, vis.getVisible());
        return TopicDTO.from(topic, vis.getVisible());
    }

    @Transactional
    public TopicDTO updateTopic(UUID topicId, String name, Integer sortOrder) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can update topics");
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        if (name != null) topic.setName(name);
        if (sortOrder != null) topic.setSortOrder(sortOrder);

        Topic saved = topicRepository.save(topic);
        log.info("Topic updated id={}", saved.getId());
        return TopicDTO.from(saved, false);
    }

    @Transactional
    public void deleteTopic(UUID topicId) {
        if (!SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can delete topics");
        }
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        log.warn("Deleting topic id={} name={}", topicId, topic.getName());
        topicRepository.delete(topic);
    }
}
