package com.voyexa.backend.services;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PexelsImageServiceTest {

    private final PexelsImageService service = new PexelsImageService("test-key");

    @Test
    void buildSearchQueriesCreatesOrderedFocusedFallbacks() {
        List<String> queries = service.buildSearchQueries("Visit the Eiffel Tower", "Paris");

        assertFalse(queries.isEmpty());
        assertEquals("Visit the Eiffel Tower Paris", queries.get(0));
        assertTrue(queries.contains("eiffel tower Paris"));
        assertTrue(queries.contains("Visit the Eiffel Tower"));
        assertTrue(queries.contains("eiffel tower"));
        assertTrue(queries.contains("Paris travel"));
    }

    @Test
    void buildSearchQueriesAvoidsDuplicatesAndHandlesBlanks() {
        List<String> queries = service.buildSearchQueries("Explore Museum", "");

        assertEquals(2, queries.size());
        assertEquals("Explore Museum", queries.get(0));
        assertEquals("museum", queries.get(1));
    }
}

