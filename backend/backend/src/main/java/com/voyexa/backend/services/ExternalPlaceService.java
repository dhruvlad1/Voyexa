package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.PlaceDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.time.Duration;
import java.net.URI;

@Service
public class ExternalPlaceService {

    private static final Logger log = LoggerFactory.getLogger(ExternalPlaceService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String geoapifyBaseUrl;
    private final String geoapifyApiKey;
    private final int geoapifyLimit;

    public ExternalPlaceService(
            @Value("${geoapify.base-url}") String geoapifyBaseUrl,
            @Value("${geoapify.api-key}") String geoapifyApiKey,
            @Value("${geoapify.limit:10}") int geoapifyLimit
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(10).toMillis());
        this.restTemplate = new RestTemplate(requestFactory);
        this.objectMapper = new ObjectMapper();
        this.geoapifyBaseUrl = geoapifyBaseUrl;
        this.geoapifyApiKey = geoapifyApiKey;
        this.geoapifyLimit = geoapifyLimit;
    }

    public List<PlaceDto> searchPlaces(String query) {
        if (query == null || query.trim().isEmpty() || query.length() < 2) {
            return List.of();
        }

        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(geoapifyBaseUrl)
                    .queryParam("text", query.trim())
                    .queryParam("apiKey", geoapifyApiKey)
                    .queryParam("limit", geoapifyLimit)
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            return parseGeoapifyResponse(response);

        } catch (RestClientException e) {
            log.warn("Error calling Geoapify API: {}", e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error in searchPlaces", e);
            return List.of();
        }
    }

    private List<PlaceDto> parseGeoapifyResponse(String jsonResponse) {
        List<PlaceDto> results = new ArrayList<>();
        if (!hasText(jsonResponse)) {
            return results;
        }

        try {
            JsonNode features = objectMapper.readTree(jsonResponse).path("features");

            if (!features.isArray()) {
                return results;
            }

            for (JsonNode feature : features) {
                JsonNode properties = feature.path("properties");
                String placeName = resolvePlaceName(properties);
                String country = properties.path("country").asText("").trim();
                String region = firstNonBlank(
                        properties.path("state").asText(""),
                        properties.path("region").asText(""),
                        properties.path("county").asText("")
                );
                String description = firstNonBlank(
                        properties.path("formatted").asText(""),
                        properties.path("address_line2").asText(""),
                        properties.path("address_line1").asText("")
                );

                if (hasText(placeName) && hasText(country)) {
                    PlaceDto dto = new PlaceDto(
                            0,
                            placeName,
                            country,
                            region,
                            description
                    );
                    results.add(dto);
                }
            }
        } catch (Exception e) {
            log.warn("Error parsing Geoapify response: {}", e.getMessage());
        }

        return results;
    }

    private String resolvePlaceName(JsonNode properties) {
        return firstNonBlank(
                properties.path("city").asText(""),
                properties.path("town").asText(""),
                properties.path("village").asText(""),
                properties.path("suburb").asText(""),
                properties.path("name").asText(""),
                properties.path("formatted").asText("")
        );
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return "";
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
