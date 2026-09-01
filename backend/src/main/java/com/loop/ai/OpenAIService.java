package com.loop.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class OpenAIService {
    private final String apiKey;
    private final String model;
    private final RestClient client = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenAIService(@Value("${openai.api.key:}") String apiKey,
                         @Value("${openai.model:gpt-4.1-mini}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String sendPrompt(String systemPrompt, String userPrompt) {
        if (!isConfigured()) {
            throw new IllegalStateException("OPENAI_API_KEY is not configured");
        }
        try {
            String request = objectMapper.writeValueAsString(Map.of(
                    "model", model,
                    "instructions", systemPrompt,
                    "input", userPrompt,
                    "max_output_tokens", 1024
            ));
            String response = client.post()
                    .uri("https://api.openai.com/v1/responses")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(String.class);
            return extractText(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to call OpenAI API: " + e.getMessage(), e);
        }
    }

    public String sendPromptJson(String systemPrompt, String userPrompt) {
        return sendPrompt(systemPrompt + " Respond only with valid JSON, without markdown or explanation.", userPrompt).trim();
    }

    private String extractText(String response) throws Exception {
        JsonNode root = objectMapper.readTree(response);
        if (root.hasNonNull("output_text")) return root.get("output_text").asText();

        StringBuilder text = new StringBuilder();
        for (JsonNode output : root.path("output")) {
            for (JsonNode content : output.path("content")) {
                if ("output_text".equals(content.path("type").asText())) {
                    text.append(content.path("text").asText());
                }
            }
        }
        if (text.isEmpty()) throw new IllegalStateException("OpenAI returned no text output");
        return text.toString();
    }
}
