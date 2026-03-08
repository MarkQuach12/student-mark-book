package com.markbook.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "term_weeks", uniqueConstraints = @UniqueConstraint(columnNames = {"term_key", "week_index"}))
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

    public TermWeek() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Term getTerm() { return term; }
    public void setTerm(Term term) { this.term = term; }

    public Short getWeekIndex() { return weekIndex; }
    public void setWeekIndex(Short weekIndex) { this.weekIndex = weekIndex; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }
}
