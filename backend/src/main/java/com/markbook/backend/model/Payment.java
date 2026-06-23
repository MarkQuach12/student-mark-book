package com.markbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "payments", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "term_key", "week_index"}))
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_key", nullable = false)
    private Term term;

    @Column(name = "week_index", nullable = false)
    private Short weekIndex;

    @Column(nullable = false, length = 15)
    private String status = "unpaid";
}
