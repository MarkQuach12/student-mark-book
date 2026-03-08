package com.markbook.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "homework")
public class Homework {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @Column(nullable = false, length = 100)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_key", nullable = false)
    private Term term;

    @Column(name = "week_index", nullable = false)
    private Short weekIndex;

    public Homework() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ClassEntity getClassEntity() { return classEntity; }
    public void setClassEntity(ClassEntity classEntity) { this.classEntity = classEntity; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Term getTerm() { return term; }
    public void setTerm(Term term) { this.term = term; }

    public Short getWeekIndex() { return weekIndex; }
    public void setWeekIndex(Short weekIndex) { this.weekIndex = weekIndex; }
}
