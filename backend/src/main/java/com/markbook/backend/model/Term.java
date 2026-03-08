package com.markbook.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "terms")
public class Term {

    @Id
    @Column(length = 20)
    private String key;

    @Column(nullable = false, length = 50)
    private String label;

    @Column(name = "sort_order", nullable = false, unique = true)
    private Short sortOrder;

    @OneToMany(mappedBy = "term", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("weekIndex ASC")
    private List<TermWeek> weeks;

    public Term() {}

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public Short getSortOrder() { return sortOrder; }
    public void setSortOrder(Short sortOrder) { this.sortOrder = sortOrder; }

    public List<TermWeek> getWeeks() { return weeks; }
    public void setWeeks(List<TermWeek> weeks) { this.weeks = weeks; }
}
