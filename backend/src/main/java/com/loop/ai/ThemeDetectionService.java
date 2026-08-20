package com.loop.ai;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ThemeDetectionService {

    private final ClaudeService claudeService;

    public ThemeDetectionService(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    /**
     * Detect themes from feedback content.
     */
    public List<String> detectThemes(String content) {
        String systemPrompt = "You are a theme detection expert for customer feedback. Identify 1-5 key themes from the feedback. Return ONLY a JSON array of theme strings. Themes should be concise (1-3 words each), specific, and relevant to product feedback.";

        String userPrompt = "Extract key themes from this customer feedback:\n\n\"" + content + "\"\n\nReturn JSON array only, e.g., [\"UI Design\", \"Performance\", \"Onboarding\"]";

        String response = claudeService.sendPromptJson(systemPrompt, userPrompt);

        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(response);

            if (node.isArray()) {
                return mapper.convertValue(node, mapper.getTypeFactory().constructCollectionType(List.class, String.class));
            }
        } catch (Exception e) {
            // Fallback to keyword-based theme detection
        }

        return fallbackThemes(content);
    }

    /**
     * Detect themes for multiple feedback items.
     */
    public List<List<String>> detectBatch(List<String> contents) {
        return contents.stream()
                .map(this::detectThemes)
                .toList();
    }

    /**
     * Aggregate themes across multiple feedback items with counts.
     */
    public List<ThemeCount> aggregateThemes(List<List<String>> allThemes) {
        return allThemes.stream()
                .flatMap(List::stream)
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()))
                .entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(e -> new ThemeCount(e.getKey(), e.getValue()))
                .toList();
    }

    private List<String> fallbackThemes(String content) {
        String lower = content.toLowerCase();
        Set<String> themes = new java.util.HashSet<>();

        // Common product feedback themes
        if (lower.matches(".*\\b(ui|interface|design|layout|visual|appearance|look|dark mode|theme)\\b.*")) themes.add("UI Design");
        if (lower.matches(".*\\b(performance|speed|slow|fast|lag|responsive|load)\\b.*")) themes.add("Performance");
        if (lower.matches(".*\\b(onboard|onboarding|setup|getting started|first time|tutorial|guide)\\b.*")) themes.add("Onboarding");
        if (lower.matches(".*\\b(bug|error|crash|issue|problem|broken|fail|glitch)\\b.*")) themes.add("Bugs & Errors");
        if (lower.matches(".*\\b(feature|request|enhancement|add|would like|wish|need|missing)\\b.*")) themes.add("Feature Requests");
        if (lower.matches(".*\\b(import|export|csv|data|file|upload|download)\\b.*")) themes.add("Data Import/Export");
        if (lower.matches(".*\\b(analytics|report|dashboard|chart|graph|metric|insight)\\b.*")) themes.add("Analytics & Reporting");
        if (lower.matches(".*\\b(integration|api|connect|sync|webhook|third party)\\b.*")) themes.add("Integrations");
        if (lower.matches(".*\\b(security|privacy|permission|auth|login|password|access)\\b.*")) themes.add("Security & Privacy");
        if (lower.matches(".*\\b(mobile|ios|android|app|phone|tablet)\\b.*")) themes.add("Mobile Experience");
        if (lower.matches(".*\\b(price|pricing|cost|expensive|cheap|value|plan|subscription)\\b.*")) themes.add("Pricing");
        if (lower.matches(".*\\b(support|help|documentation|docs|faq|knowledge base|customer service)\\b.*")) themes.add("Support & Documentation");

        // If no themes detected, add generic ones based on content length
        if (themes.isEmpty()) {
            if (content.length() > 100) themes.add("Detailed Feedback");
            else themes.add("General Feedback");
        }

        return themes.stream().limit(5).toList();
    }

    public record ThemeCount(String theme, long count) {}
}