package com.markbook.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "class_topic_visibility", uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "topic_id"}))
public class ClassTopicVisibility {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    @Column(nullable = false)
    private Boolean visible = false;

    public ClassTopicVisibility() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }

    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
}
