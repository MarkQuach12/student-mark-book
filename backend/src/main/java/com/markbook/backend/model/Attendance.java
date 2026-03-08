package com.markbook.backend.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "term_key", "week_index"}))
public class Attendance {

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

    @Column(nullable = false)
    private Boolean present = false;

    public Attendance() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Term getTerm() { return term; }
    public void setTerm(Term term) { this.term = term; }

    public Short getWeekIndex() { return weekIndex; }
    public void setWeekIndex(Short weekIndex) { this.weekIndex = weekIndex; }

    public Boolean getPresent() { return present; }
    public void setPresent(Boolean present) { this.present = present; }
}
