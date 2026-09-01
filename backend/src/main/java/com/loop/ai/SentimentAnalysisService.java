package com.loop.ai;

import com.loop.model.Feedback;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SentimentAnalysisService {

    private final OpenAIService openAIService;

    public SentimentAnalysisService(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    /**
     * Analyze sentiment of a single feedback content.
     */
    public SentimentResult analyzeSentiment(String content) {
        String systemPrompt = "You are a sentiment analysis expert. Analyze the sentiment of customer feedback text. Return ONLY a JSON object with: sentiment (POSITIVE/NEUTRAL/NEGATIVE), score (0.0-1.0), confidence (0.0-1.0).";

        String userPrompt = "Analyze the sentiment of this customer feedback:\n\n\"" + content + "\"\n\nReturn JSON only.";

        try {
            if (!openAIService.isConfigured()) return fallbackSentiment(content);
            String response = openAIService.sendPromptJson(systemPrompt, userPrompt);
            // Parse JSON response
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(response);

            String sentiment = node.has("sentiment") ? node.get("sentiment").asText() : "NEUTRAL";
            double score = node.has("score") ? node.get("score").asDouble() : 0.5;
            double confidence = node.has("confidence") ? node.get("confidence").asDouble() : 0.8;

            return new SentimentResult(sentiment.toUpperCase(), score, confidence);
        } catch (Exception e) {
            // Fallback: simple keyword-based sentiment
            return fallbackSentiment(content);
        }
    }

    /**
     * Analyze sentiment for multiple feedback items in batch.
     */
    public List<SentimentResult> analyzeBatch(List<String> contents) {
        return contents.stream()
                .map(this::analyzeSentiment)
                .toList();
    }

    /**
     * Update feedback object with sentiment analysis.
     */
    public void enrichFeedback(Feedback feedback) {
        if (feedback.getContent() != null && !feedback.getContent().isBlank()) {
            SentimentResult result = analyzeSentiment(feedback.getContent());
            feedback.setSentiment(result.sentiment());
            feedback.setSentimentScore(result.score());
        }
    }

    private SentimentResult fallbackSentiment(String content) {
        String lower = content.toLowerCase();
        int positive = 0, negative = 0;

        String[] positiveWords = {"great", "excellent", "amazing", "love", "best", "awesome", "fantastic", "wonderful", "perfect", "happy", "satisfied", "good", "nice", "impressive", "beautiful", "stunning"};
        String[] negativeWords = {"bad", "terrible", "awful", "hate", "worst", "horrible", "disappointed", "frustrated", "angry", "broken", "failed", "error", "issue", "problem", "bug", "slow", "crash", "poor"};

        for (String w : positiveWords) if (lower.contains(w)) positive++;
        for (String w : negativeWords) if (lower.contains(w)) negative++;

        if (positive > negative) return new SentimentResult("POSITIVE", 0.75, 0.7);
        if (negative > positive) return new SentimentResult("NEGATIVE", 0.25, 0.7);
        return new SentimentResult("NEUTRAL", 0.5, 0.6);
    }

    public record SentimentResult(String sentiment, double score, double confidence) {}
}
