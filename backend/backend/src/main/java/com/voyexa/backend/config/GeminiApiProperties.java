package com.voyexa.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "gemini.api")
public class GeminiApiProperties {

    private String keys;                    // Master pool: all keys for planner
    private String limitedKeys;             // Limited pool: subset for validator/dashboard/alternatives
    private String plannerKey;              // Legacy: backward compatibility
    private String validatorKey;            // Legacy: backward compatibility
    private String url;                     // Gemini API endpoint URL
    private int cooldownSeconds = 30;       // Base cooldown on throttle
    private int maxAttempts = 10;           // Max retry attempts
    private int initialBackoffMs = 200;     // Starting backoff
    private int maxBackoffMs = 1500;        // Max backoff ceiling

    // Getters and Setters

    public String getKeys() {
        return keys;
    }

    public void setKeys(String keys) {
        this.keys = keys;
    }

    public String getLimitedKeys() {
        return limitedKeys;
    }

    public void setLimitedKeys(String limitedKeys) {
        this.limitedKeys = limitedKeys;
    }

    public String getPlannerKey() {
        return plannerKey;
    }

    public void setPlannerKey(String plannerKey) {
        this.plannerKey = plannerKey;
    }

    public String getValidatorKey() {
        return validatorKey;
    }

    public void setValidatorKey(String validatorKey) {
        this.validatorKey = validatorKey;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getCooldownSeconds() {
        return cooldownSeconds;
    }

    public void setCooldownSeconds(int cooldownSeconds) {
        this.cooldownSeconds = cooldownSeconds;
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public int getInitialBackoffMs() {
        return initialBackoffMs;
    }

    public void setInitialBackoffMs(int initialBackoffMs) {
        this.initialBackoffMs = initialBackoffMs;
    }

    public int getMaxBackoffMs() {
        return maxBackoffMs;
    }

    public void setMaxBackoffMs(int maxBackoffMs) {
        this.maxBackoffMs = maxBackoffMs;
    }

    // Helper methods to resolve keys with fallback logic

    /**
     * Resolve all keys for planner (master pool)
     * Falls back to plannerKey if keys is not set
     */
    public List<String> resolveAllKeys() {
        String keyString = (keys != null && !keys.isEmpty()) ? keys : plannerKey;
        if (keyString == null || keyString.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(keyString.split(","));
    }

    /**
     * Resolve limited keys for validator/dashboard/alternatives (limited pool)
     * Falls back to validatorKey if limitedKeys is not set
     */
    public List<String> resolveLimitedKeys() {
        String keyString = (limitedKeys != null && !limitedKeys.isEmpty()) ? limitedKeys : validatorKey;
        if (keyString == null || keyString.isEmpty()) {
            return new ArrayList<>();
        }
        return Arrays.asList(keyString.split(","));
    }
}

