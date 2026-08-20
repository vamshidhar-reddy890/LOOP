package com.loop.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "feedbacks")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text")
    private String content;

    private String source;
    private String sentiment;

    @Column(name = "sentiment_score")
    private Double sentimentScore = 0.5;

    @ElementCollection
    @CollectionTable(name = "feedback_themes", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "theme")
    private List<String> themes;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_email")
    private String customerEmail;

    private Integer rating = 3;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }
    public Double getSentimentScore() { return sentimentScore; }
    public void setSentimentScore(Double sentimentScore) { this.sentimentScore = sentimentScore; }
    public List<String> getThemes() { return themes; }
    public void setThemes(List<String> themes) { this.themes = themes; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public Workspace getWorkspace() { return workspace; }
    public void setWorkspace(Workspace workspace) { this.workspace = workspace; }
    public Long getWorkspaceId() { return workspace != null ? workspace.getId() : null; }
}
