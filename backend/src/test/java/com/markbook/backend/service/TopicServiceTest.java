package com.markbook.backend.service;

import com.markbook.backend.dto.TopicDTO;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.ClassTopicVisibility;
import com.markbook.backend.model.Topic;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.ClassTopicVisibilityRepository;
import com.markbook.backend.repository.TopicRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopicServiceTest {

    @Mock private TopicRepository topicRepository;
    @Mock private ClassRepository classRepository;
    @Mock private ClassTopicVisibilityRepository visibilityRepository;

    @InjectMocks
    private TopicService topicService;

    private static final String USER_ID = "user-123";
    private static final UUID CLASS_ID = UUID.randomUUID();
    private static final UUID TOPIC_ID = UUID.randomUUID();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsAdmin() {
        var auth = new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void authenticateAsStandardUser() {
        var auth = new UsernamePasswordAuthenticationToken(
                USER_ID, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Topic buildTopic(UUID id, String name) {
        Topic topic = new Topic();
        topic.setId(id);
        topic.setName(name);
        topic.setClassLevel("Year 10");
        topic.setSortOrder(0);
        topic.setResources(new ArrayList<>());
        return topic;
    }

    // -------------------------------------------------------
    // getTopicsForClass
    // -------------------------------------------------------
    @Nested
    class GetTopicsForClass {

        @Test
        void adminSeesAllTopicsWithVisibilityFlag() {
            authenticateAsAdmin();
            Topic t1 = buildTopic(TOPIC_ID, "Algebra");
            UUID t2Id = UUID.randomUUID();
            Topic t2 = buildTopic(t2Id, "Geometry");

            ClassTopicVisibility vis = new ClassTopicVisibility();
            vis.setTopic(t1);
            vis.setVisible(true);

            when(topicRepository.findByClassLevelWithResources("Year 10")).thenReturn(List.of(t1, t2));
            when(visibilityRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of(vis));

            List<TopicDTO> result = topicService.getTopicsForClass(CLASS_ID, "Year 10");

            assertEquals(2, result.size());
            assertTrue(result.stream().anyMatch(t -> t.name().equals("Algebra") && t.visible()));
            assertTrue(result.stream().anyMatch(t -> t.name().equals("Geometry") && !t.visible()));
        }

        @Test
        void nonAdminSeesOnlyVisibleTopics() {
            authenticateAsStandardUser();
            Topic t1 = buildTopic(TOPIC_ID, "Algebra");
            UUID t2Id = UUID.randomUUID();
            Topic t2 = buildTopic(t2Id, "Geometry");

            ClassTopicVisibility vis = new ClassTopicVisibility();
            vis.setTopic(t1);
            vis.setVisible(true);

            when(topicRepository.findByClassLevelWithResources("Year 10")).thenReturn(List.of(t1, t2));
            when(visibilityRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of(vis));

            List<TopicDTO> result = topicService.getTopicsForClass(CLASS_ID, "Year 10");

            assertEquals(1, result.size());
            assertEquals("Algebra", result.get(0).name());
        }

        @Test
        void returnsEmptyWhenNoTopicsForClassLevel() {
            authenticateAsAdmin();
            when(topicRepository.findByClassLevelWithResources("Year 10")).thenReturn(List.of());
            when(visibilityRepository.findByClassEntityId(CLASS_ID)).thenReturn(List.of());

            List<TopicDTO> result = topicService.getTopicsForClass(CLASS_ID, "Year 10");

            assertTrue(result.isEmpty());
        }
    }

    // -------------------------------------------------------
    // createTopic
    // -------------------------------------------------------
    @Nested
    class CreateTopic {

        @Test
        void adminCreatesTopicForClassLevel() {
            authenticateAsAdmin();
            when(topicRepository.save(any(Topic.class))).thenAnswer(inv -> {
                Topic t = inv.getArgument(0);
                t.setId(TOPIC_ID);
                t.setResources(new ArrayList<>());
                return t;
            });

            TopicDTO result = topicService.createTopic("Year 10", "Trigonometry");

            assertEquals("Trigonometry", result.name());
            verify(topicRepository).save(any(Topic.class));
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> topicService.createTopic("Year 10", "Trigonometry"));

            assertEquals(403, ex.getStatusCode().value());
            verify(topicRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------
    // toggleVisibility
    // -------------------------------------------------------
    @Nested
    class ToggleVisibility {

        @Test
        void togglesExistingVisibilityRecord() {
            authenticateAsAdmin();
            Topic topic = buildTopic(TOPIC_ID, "Algebra");
            ClassEntity classEntity = new ClassEntity();
            classEntity.setId(CLASS_ID);

            ClassTopicVisibility vis = new ClassTopicVisibility();
            vis.setClassEntity(classEntity);
            vis.setTopic(topic);
            vis.setVisible(false);

            when(topicRepository.findById(TOPIC_ID)).thenReturn(Optional.of(topic));
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(visibilityRepository.findByClassEntityIdAndTopicId(CLASS_ID, TOPIC_ID))
                    .thenReturn(Optional.of(vis));

            TopicDTO result = topicService.toggleVisibility(CLASS_ID, TOPIC_ID);

            assertTrue(result.visible());
            verify(visibilityRepository).save(vis);
        }

        @Test
        void createsNewVisibilityRecordWhenNoneExists() {
            authenticateAsAdmin();
            Topic topic = buildTopic(TOPIC_ID, "Algebra");
            ClassEntity classEntity = new ClassEntity();
            classEntity.setId(CLASS_ID);

            when(topicRepository.findById(TOPIC_ID)).thenReturn(Optional.of(topic));
            when(classRepository.findById(CLASS_ID)).thenReturn(Optional.of(classEntity));
            when(visibilityRepository.findByClassEntityIdAndTopicId(CLASS_ID, TOPIC_ID))
                    .thenReturn(Optional.empty());

            TopicDTO result = topicService.toggleVisibility(CLASS_ID, TOPIC_ID);

            assertTrue(result.visible());
            verify(visibilityRepository).save(any(ClassTopicVisibility.class));
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> topicService.toggleVisibility(CLASS_ID, TOPIC_ID));

            assertEquals(403, ex.getStatusCode().value());
        }
    }

    // -------------------------------------------------------
    // updateTopic
    // -------------------------------------------------------
    @Nested
    class UpdateTopic {

        @Test
        void updatesTopicNameAndSortOrder() {
            authenticateAsAdmin();
            Topic topic = buildTopic(TOPIC_ID, "Old Name");
            when(topicRepository.findById(TOPIC_ID)).thenReturn(Optional.of(topic));
            when(topicRepository.save(any(Topic.class))).thenAnswer(inv -> inv.getArgument(0));

            TopicDTO result = topicService.updateTopic(TOPIC_ID, "New Name", 5);

            assertEquals("New Name", result.name());
            assertEquals(5, result.sortOrder());
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> topicService.updateTopic(TOPIC_ID, "New", 1));

            assertEquals(403, ex.getStatusCode().value());
        }
    }

    // -------------------------------------------------------
    // deleteTopic
    // -------------------------------------------------------
    @Nested
    class DeleteTopic {

        @Test
        void adminDeletesTopic() {
            authenticateAsAdmin();
            Topic topic = buildTopic(TOPIC_ID, "Algebra");
            when(topicRepository.findById(TOPIC_ID)).thenReturn(Optional.of(topic));

            topicService.deleteTopic(TOPIC_ID);

            verify(topicRepository).delete(topic);
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> topicService.deleteTopic(TOPIC_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(topicRepository, never()).delete(any());
        }
    }
}
