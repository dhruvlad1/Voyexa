package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
@Data
@Service
public class ItineraryService {

    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    private final RestTemplate restTemplate;
    private final String plannerApiKey;
    private final String validatorApiKey;
    private final String geminiApiUrl;

    public ItineraryService(
            @Value("${gemini.api.planner-key}") String plannerApiKey,
            @Value("${gemini.api.validator-key}") String validatorApiKey,
            @Value("${gemini.api.url}") String geminiApiUrl
    ) {
        this.restTemplate = new RestTemplate();
        this.plannerApiKey = plannerApiKey;
        this.validatorApiKey = validatorApiKey;
        this.geminiApiUrl = geminiApiUrl;
    }

    public String generateItinerary(TripGenerationRequestDto requestDto) {
        // Step 1: Build the Planner Prompt
        String plannerPrompt = buildPlannerPrompt(requestDto);
        log.info("Calling Planner Agent...");

        // Step 2: Call the Planner Agent
        String plannerResponseJson = callAiModel(plannerPrompt, plannerApiKey);
        if (plannerResponseJson == null || plannerResponseJson.isBlank()) {
            log.error("Planner agent returned an empty or null response.");
            return "{\"error\": \"Planner agent failed to return a response.\"}";
        }
        log.info("Planner Agent responded. Calling Validator Agent...");

        // Step 3: Build the Validator Prompt
        String validatorPrompt = buildValidatorPrompt(plannerResponseJson);

        // Step 4: Call the Validator Agent
        String finalJsonResponse = callAiModel(validatorPrompt, validatorApiKey);
        if (finalJsonResponse == null || finalJsonResponse.isBlank()) {
            log.error("Validator agent returned an empty or null response. Returning planner response as fallback.");
            return plannerResponseJson; // Fallback to the planner's response
        }
        log.info("Validator Agent responded.");

        // Step 5: Return the validated JSON
        return finalJsonResponse;
    }

    private String callAiModel(String prompt, String apiKey) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("YOUR_")) {
            log.error("Gemini API key is not configured. Please check your application.yaml.");
            return "{\"error\": \"AI service is not configured.\"}";
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
            return "{\"error\": \"Failed to call AI service: " + e.getMessage() + "\"}";
        }
    }

    private String cleanApiResponse(String rawText) {
        // The API sometimes wraps the JSON in markdown code fences. Remove them.
        return rawText.replace("```json", "").replace("```", "").trim();
    }

    //<editor-fold desc="Prompt Building and DTOs">
    private String buildPlannerPrompt(TripGenerationRequestDto dto) {
        String combinedInterests = Stream.concat(dto.getInterests().stream(), dto.getOtherInterests().stream())
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(", "));

        return """
                ROLE:
                You are Voyexa, an expert AI travel planner.

                MISSION:
                Generate a realistic, personalized, day-by-day travel itinerary based on the user’s trip details.

                OUTPUT RULE:
                Return ONLY valid JSON. No markdown, no commentary, no code fences, no extra text before or after the JSON.

                STRICT JSON RULES:
                - Output must be valid JSON parsable by standard JSON parsers.
                - Use double quotes for all strings.
                - Use null for missing or unavailable values.
                - Do not omit required keys.
                - Do not add extra keys.
                - Do not include trailing commas.
                - Do not wrap the response in markdown.

                TRIP INPUTS:
                - Origin: %s
                - Destination: %s
                - Start Date: %s
                - End Date: %s
                - Date Flexibility: %s
                - Travelers: %s
                - Budget: %s
                - Accommodation Type: %s
                - Travel Pace: %s
                - Interests: %s

                PLANNING RULES:
                - Build a real-world feasible itinerary for the destination.
                - Use only real, well-known places, neighborhoods, attractions, and activity types.
                - Do not invent fake hotel names, fake attractions, fake booking links, or exact live prices.
                - If exact pricing or booking data is unknown, use null or a realistic estimate label such as "$$" or "approximate".
                - Keep activities geographically clustered within each day.
                - Do not overload a day beyond the specified pace.
                - Do not repeat the same attraction, area, or primary activity across multiple days.
                - Strongly prioritize the listed interests.
                - If interests are empty, create a balanced mix of iconic sightseeing, local food, and leisure.
                - Budget must influence the recommendations:
                  - Cheap → mostly Free or $
                  - Moderate → mix of $ and $$
                  - Luxury → mostly $$ and $$$
                - Accommodation advice must match both {accommodationType} and {budget}.
                - Day 1 must include arrival/travel logistics from origin to destination and check-in.
                - Final day must include departure logistics returning to origin.
                - Other days should only include logistics if truly needed.
                - If date flexibility is present, prefer the most natural schedule within the provided range.
                - Make the trip vibe consistent with travel pace:
                  - Relaxed → 1 to 2 main activities with downtime
                  - Balanced → standard tourist day
                  - Packed → full day with efficient sequencing

                CONTENT GUIDELINES:
                - Trip summary should feel personalized and concise.
                - Accommodation advice should recommend a suitable area or neighborhood, not a fake hotel.
                - Activity descriptions should be practical and specific.
                - Include estimated time and cost tier where required.
                - Use simple, clean, frontend-friendly text.

                OUTPUT JSON SCHEMA:
                {
                  "tripSummary": "string",
                  "accommodationAdvice": "string",
                  "itinerary": [
                    {
                      "dayNumber": 1,
                      "date": "YYYY-MM-DD",
                      "themeTitle": "string",
                      "logistics": "string or null",
                      "morning": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "whyItFits": "string"
                      },
                      "afternoon": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "estimatedTime": "string",
                        "costTier": "Free | $ | $$ | $$$"
                      },
                      "evening": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "restaurantType": "string"
                      },
                      "travelTip": "string"
                    }
                  ]
                }

                FINAL CHECK BEFORE RESPONDING:
                - Make sure the JSON is valid.
                - Make sure the itinerary is realistic.
                - Make sure the pacing matches the user’s preference.
                - Make sure the last day ends with departure logistics.
                """.formatted(
                        dto.getOrigin(),
                        dto.getDestination(),
                        dto.getStartDate(),
                        dto.getEndDate(),
                        dto.getFlexibility(),
                        dto.getTravelers() + " (" + dto.getTravelerCount() + " people)",
                        dto.getBudget(),
                        dto.getAccommodationType(),
                        dto.getTravelPace(),
                        combinedInterests
                );
    }

    private String buildValidatorPrompt(String plannerJson) {
        return """
                ROLE:
                You are a strict JSON validator and itinerary quality controller for Voyexa.

                MISSION:
                Take the itinerary JSON and return a corrected version that is valid, consistent, realistic, and ready for frontend use.

                OUTPUT RULE:
                Return ONLY valid JSON. No markdown, no explanation, no surrounding text.

                VALIDATION RULES:
                - Fix JSON syntax errors.
                - Preserve the schema exactly.
                - Do not add new top-level keys.
                - Do not remove required keys.
                - Replace missing or unusable values with null.
                - Keep all values as plain JSON types.
                - Ensure all strings are properly quoted.
                - Ensure the output is parsable by standard JSON parsers.

                QUALITY RULES:
                - Keep the itinerary realistic for the destination and dates.
                - Ensure day-by-day flow is geographically sensible.
                - Ensure travel pace matches the number of activities.
                - Ensure interests are reflected naturally across the trip.
                - Ensure budget alignment is reasonable.
                - Do not repeat the same place or primary activity across multiple days.
                - Day 1 must include arrival logistics and check-in.
                - Final day must include departure logistics returning to origin.
                - If booking links are not available, keep bookingLink as null.
                - If estimated costs are not known exactly, keep them as cost tiers only.
                - Do not invent new facts that were not present in the source unless required to repair structure or realism.

                REPAIR PRIORITY:
                1. Make the JSON valid.
                2. Restore missing required fields.
                3. Fix schema mismatches.
                4. Remove duplicates.
                5. Improve realism and pacing.
                6. Preserve the original intent and style as much as possible.

                EXPECTED OUTPUT SCHEMA:
                {
                  "tripSummary": "string",
                  "accommodationAdvice": "string",
                  "itinerary": [
                    {
                      "dayNumber": 1,
                      "date": "YYYY-MM-DD",
                      "themeTitle": "string",
                      "logistics": "string or null",
                      "morning": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "whyItFits": "string"
                      },
                      "afternoon": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "estimatedTime": "string",
                        "costTier": "Free | $ | $$ | $$$"
                      },
                      "evening": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "restaurantType": "string"
                      },
                      "travelTip": "string"
                    }
                  ]
                }
                
                The potentially invalid JSON to fix is below:
                %s
                """.formatted(plannerJson);
    }

    // Inner classes for Gemini API request/response mapping
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
        private static class Candidate {
            private Content content;

        }

        @Setter
        @Getter
        private static class Content {
            private List<Part> parts;

        }

        @Setter
        @Getter
        private static class Part {
            private String text;

        }
    }
    //</editor-fold>
}
