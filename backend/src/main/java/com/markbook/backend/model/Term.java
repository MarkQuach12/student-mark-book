package com.markbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "terms")
@Getter
@Setter
@NoArgsConstructor
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
}
