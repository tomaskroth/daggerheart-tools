package com.dhsrd.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Set;

@Entity
@Table(name = "srd_items", indexes = {
        @Index(name="idx_srd_slug", columnList = "slug", unique = true),
        @Index(name="idx_srd_type", columnList = "type")
})
public class SrdItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SrdType type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 800)
    private String excerpt;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String content;  // full SRD text

    private String subtype;

    private int recallCost;
    private Integer level;   // optional
    private String sourceRef;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name="srd_tags", joinColumns=@JoinColumn(name="item_id"))
    @Column(name="tag")
    private Set<String> tags;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    public SrdItem() {}

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SrdType getType() { return type; }
    public void setType(SrdType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getSubtype() { return subtype; }
    public void setSubtype(String subtype) { this.subtype = subtype; }

    public int getRecallCost() { return recallCost; }
    public void setRecallCost(int recallCost) { this.recallCost = recallCost; }

    public String getSourceRef() { return sourceRef; }
    public void setSourceRef(String sourceRef) { this.sourceRef = sourceRef; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
