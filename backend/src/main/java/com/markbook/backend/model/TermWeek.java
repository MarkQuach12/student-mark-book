package com.markbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "term_weeks", uniqueConstraints = @UniqueConstraint(columnNames = {"term_key", "week_index"}))
@Getter
@Setter
@NoArgsConstructor
public class TermWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "term_key", nullable = false)
    private Term term;

    @Column(name = "week_index", nullable = false)
    private Short weekIndex;

    @Column(nullable = false, length = 20)
    private String label;

    @Column(name = "date_range", nullable = false, length = 30)
    private String dateRange;
}
