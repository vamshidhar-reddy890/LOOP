package com.loop.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type;

    @Column(name = "period_start")
    private String periodStart;

    @Column(name = "period_end")
    private String periodEnd;

    @Column(columnDefinition = "text")
    private String summary;

    // changed to text to avoid jsonb type errors when inserting from String values in dev
    @Column(columnDefinition = "text")
    private String insights;

    private String status = "COMPLETED";

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getPeriodStart() { return periodStart; }
    public void setPeriodStart(String periodStart) { this.periodStart = periodStart; }
    public String getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(String periodEnd) { this.periodEnd = periodEnd; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getInsights() { return insights; }
    public void setInsights(String insights) { this.insights = insights; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public Long getWorkspaceId() { return workspace != null ? workspace.getId() : null; }
}
