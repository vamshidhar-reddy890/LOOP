package com.loop.controller;

import com.loop.ai.OpenAIService;
import com.loop.ai.SentimentAnalysisService;
import com.loop.ai.ThemeDetectionService;
import com.loop.model.Feedback;
import com.loop.repository.FeedbackRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final OpenAIService openAIService;
    private final SentimentAnalysisService sentimentService;
    private final ThemeDetectionService themeService;
    private final FeedbackRepository feedbackRepository;

    public AIController(OpenAIService openAIService,
                        SentimentAnalysisService sentimentService,
                        ThemeDetectionService themeService,
                        FeedbackRepository feedbackRepository) {
        this.openAIService = openAIService;
        this.sentimentService = sentimentService;
        this.themeService = themeService;
        this.feedbackRepository = feedbackRepository;
    }

    /**
     * Analyze sentiment of a text.
     */
    @PostMapping("/sentiment")
    public ResponseEntity<?> analyzeSentiment(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }
        var result = sentimentService.analyzeSentiment(text);
        return ResponseEntity.ok(Map.of(
                "sentiment", result.sentiment(),
                "score", result.score(),
                "confidence", result.confidence()
        ));
    }

    /**
     * Detect themes from a text.
     */
    @PostMapping("/themes")
    public ResponseEntity<?> detectThemes(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }
        List<String> themes = themeService.detectThemes(text);
        return ResponseEntity.ok(Map.of("themes", themes));
    }

    /**
     * Analyze sentiment and detect themes in one call.
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeFeedback(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text is required"));
        }

        var sentiment = sentimentService.analyzeSentiment(text);
        List<String> themes = themeService.detectThemes(text);

        return ResponseEntity.ok(Map.of(
                "sentiment", sentiment.sentiment(),
                "score", sentiment.score(),
                "confidence", sentiment.confidence(),
                "themes", themes
        ));
    }

    /**
     * Batch analyze multiple feedback items.
     */
    @PostMapping("/batch-analyze")
    public ResponseEntity<?> batchAnalyze(@RequestBody Map<String, List<String>> body) {
        List<String> texts = body.get("texts");
        if (texts == null || texts.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Texts array is required"));
        }

        List<SentimentAnalysisService.SentimentResult> sentiments = sentimentService.analyzeBatch(texts);
        List<List<String>> allThemes = themeService.detectBatch(texts);
        List<ThemeDetectionService.ThemeCount> aggregated = themeService.aggregateThemes(allThemes);

        return ResponseEntity.ok(Map.of(
                "sentiments", sentiments,
                "themes", allThemes,
                "aggregatedThemes", aggregated
        ));
    }

    /**
     * Re-analyze all feedback in a workspace.
     */
    @PostMapping("/reanalyze-workspace/{workspaceId}")
    public ResponseEntity<?> reanalyzeWorkspace(@PathVariable Long workspaceId) {
        List<Feedback> feedbacks = feedbackRepository.findByWorkspaceId(workspaceId);
        int updated = 0;

        for (Feedback feedback : feedbacks) {
            if (feedback.getContent() != null && !feedback.getContent().isBlank()) {
                var sentiment = sentimentService.analyzeSentiment(feedback.getContent());
                List<String> themes = themeService.detectThemes(feedback.getContent());

                feedback.setSentiment(sentiment.sentiment());
                feedback.setSentimentScore(sentiment.score());
                feedback.setThemes(themes);
                feedbackRepository.save(feedback);
                updated++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "totalFeedback", feedbacks.size(),
                "updated", updated,
                "message", "Re-analysis complete"
        ));
    }

    /**
     * Generate executive summary from feedback data.
     */
    @PostMapping("/executive-summary")
    public ResponseEntity<?> generateExecutiveSummary(@RequestBody Map<String, Object> body) {
        String feedbackText = (String) body.get("feedbackText");
        String period = (String) body.getOrDefault("period", "this period");

        if (feedbackText == null || feedbackText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Feedback text is required"));
        }

        String systemPrompt = "You are a senior product analyst writing an executive summary. Create a concise, professional summary of customer feedback for leadership. Focus on key trends, sentiment shifts, and actionable insights. Write in a clear, business-appropriate tone.";

        String userPrompt = "Write an executive summary for " + period + " based on this aggregated feedback:\n\n" + feedbackText;

        if (!openAIService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("error", "OPENAI_API_KEY is not configured"));
        }
        String summary = openAIService.sendPrompt(systemPrompt, userPrompt);

        return ResponseEntity.ok(Map.of("summary", summary));
    }

    /**
     * Health check for AI services.
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "services", Map.of(
                        "openai", openAIService.isConfigured() ? "configured" : "not configured",
                        "sentiment", "ready",
                        "themes", "ready"
                )
        ));
    }
}
