package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PexelsImageService {

    private static final Logger log = LoggerFactory.getLogger(PexelsImageService.class);
    private static final String SEARCH_URL = "https://api.pexels.com/v1/search";
    private static final int PER_PAGE = 5;
    private static final double CONFIDENCE_THRESHOLD = 1.2;
    private static final Set<String> TITLE_STOP_WORDS = Set.of(
            "a", "an", "the", "to", "at", "in", "on", "for", "of", "and", "or",
            "visit", "explore", "discover", "experience", "enjoy", "walk", "stroll"
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pexelsApiKey;

    public PexelsImageService(@Value("${pexels.api-key:YOUR_PEXELS_API_KEY}") String pexelsApiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.pexelsApiKey = pexelsApiKey;
    }

    /**
     * Backward-compatible entrypoint that treats the input as a prebuilt query.
     */
    public String fetchImageForActivity(String query) {
        return fetchImageForActivity(query, "");
    }

    /**
     * Fetches a relevant image using short, focused fallback queries.
     */
    public String fetchImageForActivity(String title, String location) {
        if (pexelsApiKey == null || pexelsApiKey.isBlank() || pexelsApiKey.startsWith("YOUR_")) {
            log.warn("Pexels API key not configured. Using fallback image.");
            return getDefaultImage();
        }

        try {
            List<String> queries = buildSearchQueries(title, location);
            Candidate bestCandidate = null;

            for (String query : queries) {
                Candidate candidate = searchBestCandidateForQuery(query);
                if (candidate == null) {
                    continue;
                }

                if (bestCandidate == null || candidate.score() > bestCandidate.score()) {
                    bestCandidate = candidate;
                }

                if (candidate.score() >= CONFIDENCE_THRESHOLD) {
                    return candidate.url();
                }
            }

            return bestCandidate != null ? bestCandidate.url() : getDefaultImage();

        } catch (RestClientException e) {
            log.warn("Error calling Pexels API for activity '{} {}': {}", title, location, e.getMessage());
            return getDefaultImage();
        } catch (Exception e) {
            log.error("Unexpected error fetching image from Pexels", e);
            return getDefaultImage();
        }
    }

    List<String> buildSearchQueries(String rawTitle, String rawLocation) {
        String title = sanitizeForQuery(rawTitle);
        String location = sanitizeForQuery(rawLocation);
        String coreTitle = simplifyTitle(title);

        LinkedHashSet<String> ordered = new LinkedHashSet<>();
        addIfValid(ordered, joinQuery(title, location));
        addIfValid(ordered, joinQuery(coreTitle, location));
        addIfValid(ordered, title);
        addIfValid(ordered, coreTitle);
        if (!location.isBlank()) {
            addIfValid(ordered, joinQuery(location, "travel"));
        }

        return new ArrayList<>(ordered);
    }

    private Candidate searchBestCandidateForQuery(String query) {
        String jsonResponse = callPexels(query);
        return parseBestCandidate(jsonResponse, query);
    }

    private String callPexels(String query) {
        URI uri = UriComponentsBuilder
                .fromUriString(SEARCH_URL)
                .queryParam("query", query)
                .queryParam("orientation", "landscape")
                .queryParam("per_page", PER_PAGE)
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", pexelsApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }

    private Candidate parseBestCandidate(String jsonResponse, String query) {
        if (jsonResponse == null || jsonResponse.isBlank()) {
            return null;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode photos = rootNode.path("photos");
            if (!photos.isArray() || photos.isEmpty()) {
                return null;
            }

            Set<String> queryTokens = tokenize(query);
            Candidate best = null;

            for (JsonNode photo : photos) {
                JsonNode src = photo.path("src");
                String imageUrl = pickBestSrcUrl(src);
                if (imageUrl == null) {
                    continue;
                }

                double score = scorePhoto(photo, queryTokens);
                Candidate current = new Candidate(imageUrl, score);

                if (best == null || current.score() > best.score()) {
                    best = current;
                }
            }

            return best;
        } catch (Exception e) {
            log.warn("Failed to parse Pexels response: {}", e.getMessage());
            return null;
        }
    }

    private double scorePhoto(JsonNode photo, Set<String> queryTokens) {
        String alt = sanitizeForQuery(photo.path("alt").asText(""));
        Set<String> altTokens = tokenize(alt);
        long overlap = queryTokens.stream().filter(altTokens::contains).count();

        int width = photo.path("width").asInt(0);
        int height = photo.path("height").asInt(0);
        double landscapeBoost = (width > 0 && height > 0 && width > height) ? 0.2 : 0.0;

        double overlapScore = queryTokens.isEmpty() ? 0.0 : ((double) overlap / queryTokens.size());
        return overlapScore + landscapeBoost;
    }

    private String pickBestSrcUrl(JsonNode src) {
        String large2xUrl = src.path("large2x").asText(null);
        if (isNotBlank(large2xUrl)) {
            return large2xUrl;
        }

        String largeUrl = src.path("large").asText(null);
        if (isNotBlank(largeUrl)) {
            return largeUrl;
        }

        String mediumUrl = src.path("medium").asText(null);
        if (isNotBlank(mediumUrl)) {
            return mediumUrl;
        }

        String originalUrl = src.path("original").asText(null);
        if (isNotBlank(originalUrl)) {
            return originalUrl;
        }

        return null;
    }

    private String sanitizeForQuery(String text) {
        if (text == null) {
            return "";
        }
        String cleaned = text.replaceAll("[^a-zA-Z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return cleaned.length() > 100 ? cleaned.substring(0, 100).trim() : cleaned;
    }

    private String simplifyTitle(String title) {
        if (title == null || title.isBlank()) {
            return "";
        }

        String simplified = Arrays.stream(title.split("\\s+"))
                .map(String::toLowerCase)
                .filter(token -> !TITLE_STOP_WORDS.contains(token))
                .collect(Collectors.joining(" "));

        return simplified.isBlank() ? title : simplified;
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("\\s+"))
                .filter(token -> token.length() > 2)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String joinQuery(String part1, String part2) {
        String combined = ((part1 == null ? "" : part1) + " " + (part2 == null ? "" : part2)).trim();
        return combined.replaceAll("\\s+", " ");
    }

    private void addIfValid(Set<String> target, String query) {
        if (query != null && !query.isBlank()) {
            target.add(query);
        }
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private record Candidate(String url, double score) {
    }

    private String getDefaultImage() {
        // Aesthetic generic fallback if something fails
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600";
    }
}
