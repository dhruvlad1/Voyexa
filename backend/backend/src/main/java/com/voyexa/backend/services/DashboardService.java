package com.voyexa.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.DestinationDto;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final RestTemplate restTemplate;
    private final String plannerApiKey;
    private final String geminiApiUrl;
    private final ObjectMapper objectMapper;

    // Cache to avoid spamming the Gemini API
    private List<DestinationDto> cachedDestinations = new ArrayList<>();
    private String cachedMonth = "";

    // A small list of premium placeholders for aesthetic purposes until we add Unsplash API
    private final List<String> placeholderImages = List.of(
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&q=80&w=400",
            "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=400"
    );

    public DashboardService(
            @Value("${gemini.api.planner-key}") String plannerApiKey,
            @Value("${gemini.api.url}") String geminiApiUrl
    ) {
        this.restTemplate = new RestTemplate();
        this.plannerApiKey = plannerApiKey;
        this.geminiApiUrl = geminiApiUrl;
        this.objectMapper = new ObjectMapper();
    }

    public List<DestinationDto> getTrendingDestinationsMonth() {
        String currentMonth = LocalDate.now().getMonth().name(); // E.g., "APRIL"

        if (currentMonth.equals(cachedMonth) && !cachedDestinations.isEmpty()) {
            return cachedDestinations;
        }

        log.info("Cache miss for month {}. Fetching from Gemini API...", currentMonth);
        String prompt = buildPrompt(currentMonth);
        String jsonResponse = callAiModel(prompt, plannerApiKey);

        if (jsonResponse != null) {
            try {
                List<DestinationDto> destinations = objectMapper.readValue(jsonResponse, new TypeReference<List<DestinationDto>>() {});
                
                // Add placeholder images to the destinations
                for (int i = 0; i < destinations.size(); i++) {
                    DestinationDto dto = destinations.get(i);
                    if (dto.getImageUrl() == null || dto.getImageUrl().isEmpty() || dto.getImageUrl().equals("null")) {
                        dto.setImageUrl(placeholderImages.get(i % placeholderImages.size()));
                    }
                }

                cachedDestinations = destinations;
                cachedMonth = currentMonth;
                return cachedDestinations;

            } catch (JsonProcessingException e) {
                log.error("Failed to parse Gemini response for trending destinations: {}", e.getMessage());
            }
        }

        // Fallback: return old cache if present, even if it's for a different month
        if (!cachedDestinations.isEmpty()) {
            return cachedDestinations;
        }

        return List.of();
    }

    private String buildPrompt(String month) {
        return """
                ROLE:
                You are Voyexa, an expert AI travel planner.

                MISSION:
                Identify the top 10 hottest, most highly recommended travel destinations globally for the month of %s.

                OUTPUT RULE:
                A strict JSON array. No markdown, no explanations, no code block backticks. 
                Just start with '[' and end with ']'.

                JSON FORMAT:
                [
                  {
                    "city": "string (the city name)",
                    "country": "string (the country name)",
                    "description": "string (a catchy 1-sentence reason why it's trending this month)",
                    "budget": numeric (integer, reasonable estimated cost for a 5-day solo trip in USD)
                  }
                ]
                """.formatted(month);
    }

    private String callAiModel(String prompt, String apiKey) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            log.error("Gemini API key is not configured.");
            return null;
        }

        String url = geminiApiUrl + "?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        GeminiRequest.Content content = new GeminiRequest.Content(Collections.singletonList(new GeminiRequest.Part(prompt)));
        GeminiRequest requestBody = new GeminiRequest(Collections.singletonList(content));
        HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(url, entity, GeminiResponse.class);

            return Optional.ofNullable(response.getBody())
                    .flatMap(body -> body.getCandidates().stream().findFirst())
                    .map(GeminiResponse.Candidate::getContent)
                    .map(GeminiResponse.Content::getParts)
                    .flatMap(parts -> parts.stream().findFirst())
                    .map(GeminiResponse.Part::getText)
                    .map(this::cleanApiResponse)
                    .orElse(null);

        } catch (RestClientException e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return null;
        }
    }

    private String cleanApiResponse(String rawText) {
        return rawText.replace("```json", "").replace("```", "").trim();
    }

    @Getter
    private static class GeminiRequest {
        private final List<Content> contents;
        public GeminiRequest(List<Content> contents) { this.contents = contents; }
        private static class Content {
            private final List<Part> parts;
            public Content(List<Part> parts) { this.parts = parts; }
            public List<Part> getParts() { return parts; }
        }
        @Getter
        private static class Part {
            private final String text;
            public Part(String text) { this.text = text; }
        }
    }

    @Setter
    @Getter
    private static class GeminiResponse {
        private List<Candidate> candidates;
        @Setter
        @Getter
        private static class Candidate { private Content content; }
        @Setter
        @Getter
        private static class Content { private List<Part> parts; }
        @Setter
        @Getter
        private static class Part { private String text; }
    }
}
