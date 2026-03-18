package com.markbook.backend.service;

import com.markbook.backend.dto.ResourceDTO;
import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Resource;
import com.markbook.backend.model.Topic;
import com.markbook.backend.repository.ResourceRepository;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock private ResourceRepository resourceRepository;
    @Mock private TopicRepository topicRepository;

    @InjectMocks
    private ResourceService resourceService;

    private static final String USER_ID = "user-123";
    private static final UUID TOPIC_ID = UUID.randomUUID();
    private static final UUID RESOURCE_ID = UUID.randomUUID();

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

    private Resource buildResource(UUID id, String title) {
        Resource r = new Resource();
        r.setId(id);
        r.setTitle(title);
        r.setDriveUrl("https://drive.google.com/file/" + id);
        r.setSortOrder(0);
        return r;
    }

    // -------------------------------------------------------
    // getResourcesForTopic
    // -------------------------------------------------------
    @Nested
    class GetResourcesForTopic {

        @Test
        void returnsResourcesOrderedBySortOrder() {
            Resource r1 = buildResource(RESOURCE_ID, "Worksheet 1");
            r1.setSortOrder(1);
            Resource r2 = buildResource(UUID.randomUUID(), "Worksheet 2");
            r2.setSortOrder(2);

            when(resourceRepository.findByTopicIdOrderBySortOrder(TOPIC_ID))
                    .thenReturn(List.of(r1, r2));

            List<ResourceDTO> result = resourceService.getResourcesForTopic(TOPIC_ID);

            assertEquals(2, result.size());
            assertEquals("Worksheet 1", result.get(0).title());
            assertEquals("Worksheet 2", result.get(1).title());
        }

        @Test
        void returnsEmptyForTopicWithNoResources() {
            when(resourceRepository.findByTopicIdOrderBySortOrder(TOPIC_ID))
                    .thenReturn(List.of());

            List<ResourceDTO> result = resourceService.getResourcesForTopic(TOPIC_ID);

            assertTrue(result.isEmpty());
        }
    }

    // -------------------------------------------------------
    // createResource
    // -------------------------------------------------------
    @Nested
    class CreateResource {

        @Test
        void adminCreatesResourceWithTitleAndUrl() {
            authenticateAsAdmin();
            Topic topic = new Topic();
            topic.setId(TOPIC_ID);
            when(topicRepository.findById(TOPIC_ID)).thenReturn(Optional.of(topic));
            when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> {
                Resource r = inv.getArgument(0);
                r.setId(RESOURCE_ID);
                return r;
            });

            ResourceDTO result = resourceService.createResource(TOPIC_ID, "New Worksheet", "https://example.com/ws");

            assertEquals("New Worksheet", result.title());
            assertEquals("https://example.com/ws", result.driveUrl());
            verify(resourceRepository).save(any(Resource.class));
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> resourceService.createResource(TOPIC_ID, "Worksheet", "https://example.com"));

            assertEquals(403, ex.getStatusCode().value());
            verify(resourceRepository, never()).save(any());
        }
    }

    // -------------------------------------------------------
    // deleteResource
    // -------------------------------------------------------
    @Nested
    class DeleteResource {

        @Test
        void adminDeletesResource() {
            authenticateAsAdmin();
            Resource resource = buildResource(RESOURCE_ID, "Old Worksheet");
            when(resourceRepository.findById(RESOURCE_ID)).thenReturn(Optional.of(resource));

            resourceService.deleteResource(RESOURCE_ID);

            verify(resourceRepository).delete(resource);
        }

        @Test
        void nonAdminGetsForbidden() {
            authenticateAsStandardUser();

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> resourceService.deleteResource(RESOURCE_ID));

            assertEquals(403, ex.getStatusCode().value());
            verify(resourceRepository, never()).delete(any());
        }
    }
}
