package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.voyexa.backend.DTOS.TripGenerationRequestDto;
import com.voyexa.backend.entities.TravelerProfile;
import com.voyexa.backend.repositories.TravelerProfileRepository;
import com.voyexa.backend.services.gemini.GeminiClient;
import com.voyexa.backend.services.gemini.GeminiTask;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Data
@Service
public class ItineraryService {

    private static final Logger log = LoggerFactory.getLogger(ItineraryService.class);

    private final GeminiClient geminiClient;
    private final PexelsImageService pexelsImageService;
    private final TravelerProfileRepository travelerProfileRepository;
    private final ObjectMapper objectMapper;

    public ItineraryService(
            GeminiClient geminiClient,
            PexelsImageService pexelsImageService,
            TravelerProfileRepository travelerProfileRepository
    ) {
        this.geminiClient = geminiClient;
        this.pexelsImageService = pexelsImageService;
        this.travelerProfileRepository = travelerProfileRepository;
        this.objectMapper = new ObjectMapper();
    }

    public String generateItinerary(TripGenerationRequestDto requestDto) {
        // Step 1: Build the Planner Prompt
        String plannerPrompt = buildPlannerPrompt(requestDto);
        log.info("Calling Planner Agent...");

        // Step 2: Call the Planner Agent
        String plannerResponseJson;
        try {
            plannerResponseJson = geminiClient.generateContent(plannerPrompt, GeminiTask.PLANNER);
        } catch (Exception e) {
            log.error("Planner agent failed: {}", e.getMessage());
            return "{\"error\": \"Planner agent failed to return a response.\"}";
        }

        if (plannerResponseJson == null || plannerResponseJson.isBlank()) {
            log.error("Planner agent returned an empty or null response.");
            return "{\"error\": \"Planner agent failed to return a response.\"}";
        }
        log.info("Planner Agent responded. Calling Validator Agent...");

        // Step 3: Build the Validator Prompt
        String validatorPrompt = buildValidatorPrompt(plannerResponseJson);

        // Step 4: Call the Validator Agent
        String finalJsonResponse;
        try {
            finalJsonResponse = geminiClient.generateContent(validatorPrompt, GeminiTask.VALIDATOR);
        } catch (Exception e) {
            log.warn("Validator agent failed: {}. Using planner response as fallback.", e.getMessage());
            finalJsonResponse = null;
        }

        // If validator fails, retry validator once. If still fails, use original planner response as fallback.
        if (finalJsonResponse == null || finalJsonResponse.isBlank()) {
            log.warn("Validator agent returned empty response. Retrying validator once.");
            try {
                finalJsonResponse = geminiClient.generateContent(validatorPrompt, GeminiTask.VALIDATOR);
                if (finalJsonResponse == null || finalJsonResponse.isBlank()) {
                    log.warn("Validator retry also failed; using planner response as fallback.");
                    finalJsonResponse = plannerResponseJson;
                }
            } catch (Exception e) {
                log.warn("Validator retry failed: {}. Using planner response as fallback.", e.getMessage());
                finalJsonResponse = plannerResponseJson;
            }
        } else {
            log.info("Validator Agent responded successfully.");
        }

        // Step 5: Return initial itinerary without embedded alternatives.
        String itineraryWithoutAlternatives = stripAlternativesFromItinerary(finalJsonResponse);

        // Step 6: Asynchronously fetch and inject Pexels images for each activity tree
        log.info("Injecting dynamic images from Pexels...");
        return injectImagesIntoItinerary(itineraryWithoutAlternatives);
    }

    /**
     * Call Gemini API for generating activity alternatives.
     * Uses AUXILIARY task type for consistency with the new key pool design.
     */
    public String callAiModelForAlternatives(String prompt) {
        log.info("Calling Gemini API for activity alternatives generation...");
        try {
            return geminiClient.generateContent(prompt, GeminiTask.AUXILIARY);
        } catch (Exception e) {
            log.error("Error calling Gemini API for alternatives: {}", e.getMessage());
            return null;
        }
    }

    private String cleanApiResponse(String rawText) {
        // The API sometimes wraps the JSON in markdown code fences. Remove them.
        return rawText.replace("```json", "").replace("```", "").trim();
    }

    private String stripAlternativesFromItinerary(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode itineraryArray = root.path("itinerary");
            if (!itineraryArray.isArray()) {
                return json;
            }

            for (JsonNode dayNode : itineraryArray) {
                String[] times = {"morning", "afternoon", "evening"};
                for (String time : times) {
                    JsonNode timeNode = dayNode.path(time);
                    if (timeNode.isObject()) {
                        ((ObjectNode) timeNode).remove("alternatives");
                    }
                }
            }
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            log.warn("Failed to strip embedded alternatives from itinerary JSON: {}", e.getMessage());
            return json;
        }
    }

    public String injectImagesIntoItinerary(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode itineraryArray = root.path("itinerary");
            if (!itineraryArray.isArray()) return json;

            List<java.util.concurrent.CompletableFuture<Void>> futures = new ArrayList<>();

            for (JsonNode dayNode : itineraryArray) {
                String[] times = {"morning", "afternoon", "evening"};
                for (String time : times) {
                    JsonNode timeNode = dayNode.path(time);
                    if (timeNode.isObject()) {
                        JsonNode activityNode = timeNode.path("activity");
                        if (activityNode.isObject()) {
                            String title = activityNode.path("title").asText("");
                            String location = activityNode.path("location").asText("");
                            String imageQuery = extractImageQuery(activityNode, title, location);

                            if (!imageQuery.isEmpty()) {
                                java.util.concurrent.CompletableFuture<Void> future = java.util.concurrent.CompletableFuture.runAsync(() -> {
                                    String imageUrl = pexelsImageService.fetchImageForActivity(imageQuery, location);
                                    ((ObjectNode) activityNode).put("imageUrl", imageUrl);
                                });
                                futures.add(future);
                            }
                        }

                        // Inject images for alternatives if available
                        JsonNode alternativesNode = timeNode.path("alternatives");
                        if (alternativesNode.isArray()) {
                            for (JsonNode altNode : alternativesNode) {
                                JsonNode altActivityNode = altNode.path("activity");
                                if (altActivityNode.isObject()) {
                                    String altTitle = altActivityNode.path("title").asText("");
                                    String altLocation = altActivityNode.path("location").asText("");
                                    String altImageQuery = extractImageQuery(altActivityNode, altTitle, altLocation);

                                    if (!altImageQuery.isEmpty()) {
                                        java.util.concurrent.CompletableFuture<Void> altFuture = java.util.concurrent.CompletableFuture.runAsync(() -> {
                                            String imageUrl = pexelsImageService.fetchImageForActivity(altImageQuery, altLocation);
                                            ((ObjectNode) altActivityNode).put("imageUrl", imageUrl);
                                        });
                                        futures.add(altFuture);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Wait for all image fetching to complete
            java.util.concurrent.CompletableFuture.allOf(futures.toArray(new java.util.concurrent.CompletableFuture[0])).join();

            return objectMapper.writeValueAsString(root);

        } catch (Exception e) {
            log.error("Failed to inject images into itinerary JSON", e);
            return json;
        }
    }

    private String extractImageQuery(JsonNode activityNode, String title, String location) {
        String imageQuery = activityNode.path("imageQuery").asText("").trim();
        if (!imageQuery.isBlank()) {
            return imageQuery;
        }
        String titleText = title == null ? "" : title.trim();
        String locationText = location == null ? "" : location.trim();
        if (!titleText.isBlank() && !locationText.isBlank()) {
            return titleText + " " + locationText;
        }
        if (!titleText.isBlank()) {
            return titleText;
        }
        return locationText;
    }

    //<editor-fold desc="Prompt Building and DTOs">
    private String buildPlannerPrompt(TripGenerationRequestDto dto) {
        String combinedInterests = Stream.concat(dto.getInterests().stream(), dto.getOtherInterests().stream())
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(", "));
        String selectedProfilesContext = buildSelectedProfilesContext(dto);
        String travelerVibeGuidance = buildTravelerVibeGuidance(dto.getTravelers());

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
                - Selected Traveler Profiles: %s

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
                - If Selected Traveler Profiles are provided, give equal weight to (a) direct user trip inputs and (b) selected profile preferences.
                - Explicitly incorporate selected profile interests, mobility level, and dietary preferences into activity and dining choices.
                - Balance preferences across the full itinerary so user-level inputs and different selected profiles are all represented.
                - If user inputs and profile preferences conflict, choose compromise options or alternate priorities by day/time slot while keeping the plan cohesive and practical.
                - Budget must influence the recommendations:
                  - Cheap → mostly Free or $
                  - Moderate → mix of $ and $$
                  - Luxury → mostly $$ and $$$
                - Accommodation advice must match both {accommodationType} and {budget}.
                - Every accommodation mentioned must have a corresponding booking option.
                - For each accommodation, provide a reliable booking URL from a well-known platform (Booking.com, Airbnb, Agoda, etc.).
                - Booking URLs must point to the specific property; if exact property link is unavailable, provide the closest accurate listing.
                - All accommodation links must be fully qualified HTTPS URLs on official booking platform domains only.
                - If uncertain about an exact property deep link, provide the platform's official search-results URL for that property/location instead of inventing a path.
                - Day 1 must include arrival/travel logistics from origin to destination and check-in.
                - Final day must include departure logistics returning to origin.
                - Other days should only include logistics if truly needed.
                - If date flexibility is present, prefer the most natural schedule within the provided range.
                - Make the trip vibe consistent with travel pace:
                  - Relaxed → 1 to 2 main activities with downtime
                  - Balanced → standard tourist day
                  - Packed → full day with efficient sequencing
                - Traveler-type style guidance: %s

                ALTERNATIVES GENERATION:
                - For each time slot (morning, afternoon, evening), generate 2 alternative activities.
                - Each alternative must be completely different from the main activity and from each other.
                - Alternatives should appeal to different preferences while matching the trip's budget and destination.
                - Provide varied activity types across alternatives (e.g., cultural, adventure, relaxation, food-focused, shopping, local experience).
                - Each alternative must fit the time slot duration and cost tier of the main activity.
                - Do not repeat any activity (main or alternative) across the entire itinerary.
                - Alternatives should be realistic and available in the destination.
                - When profiles are selected, alternatives should offer preference coverage for different selected profiles where possible.

                CONTENT GUIDELINES:
                - Trip summary should feel personalized and concise.
                - Accommodation advice should recommend a suitable area or neighborhood, not a fake hotel.
                - Keep accommodation formatting clean and consistent.
                - Include structured accommodation booking entries so UI can render a "Check Details" button right after accommodation details.
                - Activity descriptions should be practical and specific.
                - Every activity object (main + alternatives) must include "imageQuery": a short one-line photo search phrase containing the place and scene (e.g., "Shibuya crossing Tokyo at night").
                - Include estimated time and cost tier where required.
                - Use simple, clean, frontend-friendly text.
                - For each activity time slot, generate 2 alternative activities that offer different experiences.

                OUTPUT JSON SCHEMA:
                {
                  "tripSummary": "string",
                  "accommodationAdvice": "string",
                  "accommodationOptions": [
                    {
                      "propertyName": "string",
                      "stayType": "Hotel | Airbnb | Hostel | Guesthouse | Resort | Apartment | Other",
                      "location": "string",
                      "platform": "Booking.com | Airbnb | Agoda | Expedia | Hotels.com | Hostelworld | Other",
                      "checkDetailsUrl": "https://..."
                    }
                  ],
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
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "whyItFits": "string",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
                      },
                      "afternoon": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "estimatedTime": "string",
                        "costTier": "Free | $ | $$ | $$$",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
                      },
                      "evening": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "restaurantType": "string",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
                      },
                      "travelTip": "string"
                    }
                  ]
                }

                FINAL CHECK BEFORE RESPONDING:
                - Make sure the JSON is valid.
                - Make sure the itinerary is realistic.
                - Make sure the pacing matches the user's preference.
                - Make sure the last day ends with departure logistics.
                - Make sure each time slot includes at least 2 alternative activities.
                - Make sure no activities or alternatives are repeated across the itinerary.
                - Make sure alternatives offer meaningful variety in activity types.
                - Make sure every accommodation mention has a matching accommodationOptions entry with a usable checkDetailsUrl.
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
                travelerVibeGuidance,
                combinedInterests,
                selectedProfilesContext
        );
    }

    private String buildTravelerVibeGuidance(String travelers) {
        String normalizedTravelers = travelers == null ? "" : travelers.trim().toLowerCase(Locale.ROOT);
        return switch (normalizedTravelers) {
            case "couple" ->
                    "Prioritize romantic, intimate experiences like scenic sunsets, cozy dining, and memorable couple activities.";
            case "friends" ->
                    "Prioritize fun, social, and energetic experiences like group activities, lively areas, and shared adventures.";
            case "family" ->
                    "Prioritize relaxed, family-friendly experiences with kid-safe options, easy logistics, and low-stress pacing.";
            case "solo" ->
                    "Prioritize exploration-focused experiences with local discovery, cultural immersion, and independent-friendly options.";
            default ->
                    "Match recommendations naturally to the traveler type while keeping activities realistic and personalized.";
        };
    }

    private String buildSelectedProfilesContext(TripGenerationRequestDto dto) {
        if (dto.getSelectedProfileIds() == null || dto.getSelectedProfileIds().isEmpty()) {
            return "None selected.";
        }

        List<TravelerProfile> selectedProfiles = travelerProfileRepository.findByUserIdAndIds(
                dto.getUserId(),
                dto.getSelectedProfileIds()
        );

        if (selectedProfiles.isEmpty()) {
            return "None selected.";
        }

        return selectedProfiles.stream()
                .map(profile -> {
                    String interests = profile.getInterests() == null || profile.getInterests().isEmpty()
                            ? "none"
                            : String.join(", ", profile.getInterests());

                    return String.format(
                            "%s [relation=%s, gender=%s, mobility=%s, dietary=%s, nationality=%s, interests=%s]",
                            profile.getName(),
                            Optional.ofNullable(profile.getRelation()).orElse("unspecified"),
                            Optional.ofNullable(profile.getGender()).orElse("unspecified"),
                            Optional.ofNullable(profile.getMobilityLevel()).orElse("none"),
                            Optional.ofNullable(profile.getDietaryPreferences()).orElse("unspecified"),
                            Optional.ofNullable(profile.getNationality()).orElse("unspecified"),
                            interests
                    );
                })
                .collect(Collectors.joining(" | "));
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
                - Ensure each time slot includes an "alternatives" array with at least 2 alternatives.
                - Ensure each alternative contains the required activity structure.
                - Ensure every activity object (main + alternatives) contains a non-empty "imageQuery" string.
                - Ensure "accommodationOptions" exists and remains an array when accommodation is mentioned.
                - Ensure each accommodation checkDetailsUrl is a valid HTTPS URL on an official booking domain.

                QUALITY RULES:
                - Keep the itinerary realistic for the destination and dates.
                - Ensure day-by-day flow is geographically sensible.
                - Ensure travel pace matches the number of activities.
                - Ensure interests are reflected naturally across the trip.
                - Ensure budget alignment is reasonable.
                - Do not repeat the same place or primary activity across multiple days.
                - Do not repeat main activities within the alternatives of the same time slot.
                - Day 1 must include arrival logistics and check-in.
                - Final day must include departure logistics returning to origin.
                - If booking links are not available, keep bookingLink as null.
                - For accommodations, do not use null booking links. Provide a valid "checkDetailsUrl" from a reliable booking platform.
                - If any accommodation URL is invalid or uses an untrusted domain, replace it with an official platform search-results URL.
                - If estimated costs are not known exactly, keep them as cost tiers only.
                - Do not invent new facts that were not present in the source unless required to repair structure or realism.
                - Ensure alternatives offer meaningful variety in activity types and experiences.
                - Ensure each accommodation mentioned in accommodationAdvice has a corresponding accommodationOptions item.

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
                  "accommodationOptions": [
                    {
                      "propertyName": "string",
                      "stayType": "Hotel | Airbnb | Hostel | Guesthouse | Resort | Apartment | Other",
                      "location": "string",
                      "platform": "Booking.com | Airbnb | Agoda | Expedia | Hotels.com | Hostelworld | Other",
                      "checkDetailsUrl": "https://..."
                    }
                  ],
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
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "whyItFits": "string",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
                      },
                      "afternoon": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "estimatedTime": "string",
                        "costTier": "Free | $ | $$ | $$$",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
                      },
                      "evening": {
                        "activity": {
                          "title": "string",
                          "description": "string",
                          "location": "string",
                          "imageQuery": "string",
                          "bookingInfo": {
                            "searchQuery": "string or null",
                            "bookingLink": null
                          }
                        },
                        "restaurantType": "string",
                        "alternatives": [
                          {
                            "activity": {
                              "title": "string",
                              "description": "string",
                              "location": "string",
                              "imageQuery": "string",
                              "bookingInfo": {
                                "searchQuery": "string or null",
                                "bookingLink": null
                              }
                            }
                          }
                        ]
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
