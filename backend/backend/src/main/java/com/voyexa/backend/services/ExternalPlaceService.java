package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.PlaceDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

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
            // General Autocomplete Search without strict type filters
            List<PlaceDto> geoapifyResults = fetchAndParse(query, 6);
            if (!geoapifyResults.isEmpty()) {
                return geoapifyResults;
            }
            return fetchFromNominatim(query, 6);
        } catch (Exception e) {
            log.error("Unexpected error in searchPlaces", e);
            return List.of();
        }
    }

    private List<PlaceDto> fetchAndParse(String query, int limit) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString(geoapifyBaseUrl)
                    .queryParam("text", query.trim())
                    .queryParam("apiKey", geoapifyApiKey)
                    .queryParam("limit", limit)
                    // No explicit "type" queryParam to allow more general places (continents, provinces, etc.)
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            return parseGeoapifyResponse(response);

        } catch (RestClientException e) {
            log.warn("Error calling Geoapify API: {}", e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching/parsing Geoapify data", e);
            return List.of();
        }
    }

    private List<PlaceDto> fetchFromNominatim(String query, int limit) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", query.trim())
                    .queryParam("format", "jsonv2")
                    .queryParam("limit", limit)
                    .build(true)
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));
            headers.set("User-Agent", "Voyexa/1.0 (Location search)");

            ResponseEntity<String> response = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
            );
            return parseNominatimResponse(response.getBody());
        } catch (Exception e) {
            log.warn("Error calling Nominatim fallback API: {}", e.getMessage());
            return List.of();
        }
    }

    private List<PlaceDto> parseGeoapifyResponse(String jsonResponse) {
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
                String formatted = properties.path("formatted").asText(null);
                
                // Geoapify provides a "formatted" string which typically perfectly represents the location
                // Example: "Phuket, Thailand" or "Europe"
                String displayString = formatted;
                
                // Fallback mechanism in case "formatted" is missing
                if (displayString == null || displayString.trim().isEmpty()) {
                    String city = properties.path("city").asText(null);
                    String name = properties.path("name").asText("");
                    
                    if (city != null && !city.isEmpty() && country != null && !country.isEmpty()) {
                        displayString = city + ", " + country;
                    } else if (name != null && !name.isEmpty() && country != null && !country.isEmpty()) {
                         displayString = name + ", " + country;
                    } else if (name != null && !name.isEmpty()) {
                         displayString = name;
                    } else if (country != null && !country.isEmpty()) {
                         displayString = country;
                    }
                }

                if (displayString != null && !displayString.trim().isEmpty()) {
                    PlaceDto dto = new PlaceDto();
                    dto.setDescription(displayString); // Clean string displaying the full place
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

    private List<PlaceDto> parseNominatimResponse(String jsonResponse) {
        List<PlaceDto> results = new ArrayList<>();
        if (jsonResponse == null || jsonResponse.trim().isEmpty()) {
            return results;
        }

        try {
            JsonNode places = objectMapper.readTree(jsonResponse);
            if (!places.isArray()) {
                return results;
            }

            for (JsonNode place : places) {
                String displayName = place.path("display_name").asText("").trim();
                if (displayName.isEmpty()) {
                    continue;
                }

                JsonNode address = place.path("address");
                String country = address.path("country").asText("");
                String city = firstNonBlank(
                        address.path("city").asText(""),
                        address.path("town").asText(""),
                        address.path("village").asText(""),
                        address.path("state").asText("")
                );

                PlaceDto dto = new PlaceDto();
                dto.setDescription(displayName);
                dto.setName(city.isBlank() ? displayName : city);
                dto.setCountry(country.isBlank() ? null : country);
                results.add(dto);
            }

            return results;
        } catch (Exception e) {
            log.warn("Error parsing Nominatim response: {}", e.getMessage());
            return List.of();
        }
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return "";
    }
}
