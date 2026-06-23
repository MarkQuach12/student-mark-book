package com.markbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "homework_completions", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "homework_id"}))
@Getter
@Setter
@NoArgsConstructor
public class HomeworkCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homework_id", nullable = false)
    private Homework homework;

    @Column(nullable = false)
    private Boolean completed = false;
}
