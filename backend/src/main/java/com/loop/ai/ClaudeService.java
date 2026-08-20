package com.loop.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;
import com.anthropic.models.messages.TextBlock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.List;

@Service
public class ClaudeService {

    private final AnthropicClient client;
    private final String model;

    public ClaudeService(
            @Value("${anthropic.api.key}") String apiKey,
            @Value("${anthropic.model}") String model) {
        this.client = AnthropicOkHttpClient.builder().apiKey(apiKey).build();
        this.model = model;
    }

    /**
     * Send a prompt to Claude and get the response text.
     */
    public String sendPrompt(String systemPrompt, String userPrompt) {
        try {
            MessageCreateParams params = MessageCreateParams.builder()
                    .model(Model.of(model))
                    .maxTokens(1024)
                    .system(systemPrompt)
                    .addUserMessage(userPrompt)
                    .build();

            Message response = client.messages().create(params);

            // Extract text from the response using reflection to handle sealed interface
            StringBuilder result = new StringBuilder();
            List<ContentBlock> blocks = response.content();
            for (ContentBlock block : blocks) {
                try {
                    // Check if it's a TextBlock using reflection
                    if (block.getClass().getSimpleName().equals("TextBlock")) {
                        Method textMethod = block.getClass().getMethod("text");
                        String text = (String) textMethod.invoke(block);
                        result.append(text);
                    }
                } catch (Exception e) {
                    // Ignore and continue
                }
            }
            return result.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Claude API: " + e.getMessage(), e);
        }
    }

    /**
     * Send a prompt with JSON response expectation.
     */
    public String sendPromptJson(String systemPrompt, String userPrompt) {
        String response = sendPrompt(systemPrompt + "\n\nRespond ONLY with valid JSON. No markdown, no explanation.", userPrompt);
        return response.trim();
    }
}