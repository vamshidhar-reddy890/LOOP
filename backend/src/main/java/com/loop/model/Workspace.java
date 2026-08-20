package com.loop.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "workspaces")
public class Workspace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "member_count")
    private Integer memberCount = 1;

    @Column(name = "feedback_count")
    private Integer feedbackCount = 0;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
    public Integer getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Integer feedbackCount) { this.feedbackCount = feedbackCount; }
}
