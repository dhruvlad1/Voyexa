package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.PlaceDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class ExternalPlaceService {

    private static final Logger log = LoggerFactory.getLogger(ExternalPlaceService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String geoapifyBaseUrl;
    private final String geoapifyApiKey;

    public ExternalPlaceService(
            @Value("${geoapify.base-url}") String geoapifyBaseUrl,
            @Value("${geoapify.api-key}") String geoapifyApiKey
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());

        this.restTemplate = new RestTemplate(requestFactory);
        this.objectMapper = new ObjectMapper();
        this.geoapifyBaseUrl = geoapifyBaseUrl;
        this.geoapifyApiKey = geoapifyApiKey;
    }

    public List<PlaceDto> searchPlaces(String query) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }

        try {
            // Federated Search: Fetch countries and cities concurrently
            CompletableFuture<List<PlaceDto>> countriesFuture = CompletableFuture.supplyAsync(() -> 
                fetchAndParse(query, "country", 2)
            );

            CompletableFuture<List<PlaceDto>> citiesFuture = CompletableFuture.supplyAsync(() -> 
                fetchAndParse(query, "city", 4)
            );

            // Wait for both to complete and combine results
            CompletableFuture.allOf(countriesFuture, citiesFuture).join();

            List<PlaceDto> combinedResults = new ArrayList<>();
            combinedResults.addAll(countriesFuture.get());
            combinedResults.addAll(citiesFuture.get());

            return combinedResults;

        } catch (Exception e) {
            log.error("Unexpected error in searchPlaces", e);
            return List.of();
        }
    }

    private List<PlaceDto> fetchAndParse(String query, String type, int limit) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(geoapifyBaseUrl)
                    .queryParam("text", query.trim())
                    .queryParam("apiKey", geoapifyApiKey)
                    .queryParam("type", type)
                    .queryParam("limit", limit)
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            return parseGeoapifyResponse(response, type);

        } catch (RestClientException e) {
            log.warn("Error calling Geoapify API for type {}: {}", type, e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching/parsing for type " + type, e);
            return List.of();
        }
    }

    private List<PlaceDto> parseGeoapifyResponse(String jsonResponse, String requestType) {
        List<PlaceDto> results = new ArrayList<>();

        if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
            return results;
        }

        try {
            JsonNode features = objectMapper.readTree(jsonResponse).path("features");
            if (!features.isArray()) {
                return results;
            }

            for (JsonNode feature : features) {
                JsonNode properties = feature.path("properties");
                
                String country = properties.path("country").asText(null);
                String displayString;
                
                if ("country".equals(requestType)) {
                    // For countries, just use the country name. Fallback to properties.name if country is missing.
                    displayString = country != null ? country : properties.path("name").asText("");
                } else {
                    // For cities, use City, Country. Fallback to name if city is missing.
                    String city = properties.path("city").asText(null);
                    String primaryName = city != null ? city : properties.path("name").asText("");
                    
                    if (country != null && !country.isEmpty() && primaryName != null && !primaryName.isEmpty()) {
                        displayString = primaryName + ", " + country;
                    } else {
                         displayString = primaryName; // Fallback if country is missing
                    }
                }

                if (displayString != null && !displayString.trim().isEmpty()) {
                    PlaceDto dto = new PlaceDto();
                    dto.setDescription(displayString); // Storing the clean string in description as requested
                    dto.setName(properties.path("name").asText(""));
                    dto.setCountry(country);
                    results.add(dto);
                }
            }
            return results;

        } catch (Exception e) {
            log.warn("Error parsing Geoapify response: {}", e.getMessage());
            return List.of();
        }
    }
}