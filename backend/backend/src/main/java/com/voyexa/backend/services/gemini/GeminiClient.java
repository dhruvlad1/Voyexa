package com.voyexa.backend.services.gemini;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import com.voyexa.backend.config.GeminiApiProperties;

import java.io.IOException;
import java.util.List;

/**
 * Unified HTTP client for Gemini API calls with automatic retry and throttle handling.
 * Handles key pool management, cooldown, and backoff logic transparently.
 */
@Service
public class GeminiClient {
    private static final Logger logger = LoggerFactory.getLogger(GeminiClient.class);

    @Autowired
    private GeminiApiProperties properties;

    @Autowired
    private GeminiKeyPool keyPool;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Main method: Generate content using Gemini API
     * Handles retries, key rotation, and throttle backoff automatically
     */
    public String generateContent(String prompt, GeminiTask task) throws Exception {
        logger.info("Starting Gemini request for task: {}", task);

        // Ensure key pool is initialized
        keyPool.ensureInitialized();

        int maxAttempts = properties.getMaxAttempts();
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            String key = keyPool.tryAcquire(task);
            if (key == null) {
                lastException = new Exception("No available Gemini API keys for task: " + task);
                logger.error("Attempt {}/{}: {}", attempt, maxAttempts, lastException.getMessage());
                Thread.sleep(1000); // Wait before retrying
                continue;
            }

            try {
                String result = callGeminiApi(prompt, key);
                keyPool.onSuccess(key);
                logger.info("Gemini request successful for task {} on attempt {}", task, attempt);
                return result;
            } catch (HttpClientErrorException e) {
                if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                    // HTTP 429 - Throttled
                    keyPool.onThrottle(key);
                    logger.warn("HTTP 429 throttle on key for task {}, attempt {}/{}",
                            task, attempt, maxAttempts);

                    long backoffMs = (long) Math.pow(2, Math.min(attempt - 1, 5)) *
                            properties.getInitialBackoffMs();
                    backoffMs = Math.min(backoffMs, properties.getMaxBackoffMs());
                    Thread.sleep(backoffMs);
                } else {
                    // Other HTTP error (4xx, 5xx)
                    keyPool.onFailure(key);
                    lastException = e;
                    logger.warn("HTTP error {} for task {}, attempt {}/{}: {}",
                            e.getStatusCode(), task, attempt, maxAttempts, e.getMessage());
                    Thread.sleep(500);
                }
            } catch (Exception e) {
                keyPool.onFailure(key);
                lastException = e;
                logger.warn("Error for task {}, attempt {}/{}: {}",
                        task, attempt, maxAttempts, e.getMessage());
                Thread.sleep(500);
            }
        }

        String errorMsg = String.format(
                "Gemini request failed after %d attempts for task %s. Last error: %s",
                maxAttempts, task, lastException != null ? lastException.getMessage() : "Unknown"
        );
        logger.error(errorMsg);
        throw new Exception(errorMsg, lastException);
    }

    /**
     * Call the Gemini API directly with a single key
     */
    private String callGeminiApi(String prompt, String apiKey) throws Exception {
        String url = properties.getUrl() + "?key=" + apiKey;

        // Build request
        GeminiRequest request = new GeminiRequest();
        GeminiRequest.Content content = new GeminiRequest.Content();
        GeminiRequest.Part part = new GeminiRequest.Part();
        part.setText(prompt);
        content.getParts().add(part);
        request.getContents().add(content);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String result = extractTextFromResponse(response.getBody());
                logger.debug("Gemini API returned {} characters", result.length());
                return result;
            }
            throw new Exception("Invalid response from Gemini API: " + response.getStatusCode());
        } catch (HttpClientErrorException e) {
            logger.error("Gemini API error: {} - {}", e.getStatusCode(), e.getMessage());
            throw e;
        }
    }

    /**
     * Extract text content from Gemini response JSON
     */
    private String extractTextFromResponse(String jsonResponse) throws IOException {
        JsonNode root = objectMapper.readTree(jsonResponse);
        JsonNode candidates = root.get("candidates");

        if (candidates != null && candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.get("content");
            if (content != null) {
                JsonNode parts = content.get("parts");
                if (parts != null && parts.isArray() && parts.size() > 0) {
                    JsonNode text = parts.get(0).get("text");
                    if (text != null) {
                        return text.asText();
                    }
                }
            }
        }

        throw new IOException("Could not extract text from Gemini response");
    }

    /**
     * DTO: Gemini API Request
     */
    public static class GeminiRequest {
        @JsonProperty("contents")
        private List<Content> contents = new java.util.ArrayList<>();

        public List<Content> getContents() {
            return contents;
        }

        public static class Content {
            @JsonProperty("parts")
            private List<Part> parts = new java.util.ArrayList<>();

            public List<Part> getParts() {
                return parts;
            }
        }

        public static class Part {
            @JsonProperty("text")
            private String text;

            public String getText() {
                return text;
            }

            public void setText(String text) {
                this.text = text;
            }
        }
    }
}




