package com.voyexa.backend.services.gemini;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.voyexa.backend.config.GeminiApiProperties;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread-safe key pool manager with round-robin selection and cooldown tracking.
 * Manages separate pools for planner (all keys) and limited services (subset of keys).
 */
@Service
public class GeminiKeyPool {
    private static final Logger logger = LoggerFactory.getLogger(GeminiKeyPool.class);

    private static class KeyState {
        String key;
        long nextAvailableAtMs;
        AtomicInteger consecutiveThrottles;

        KeyState(String key) {
            this.key = key;
            this.nextAvailableAtMs = 0;
            this.consecutiveThrottles = new AtomicInteger(0);
        }
    }

    private final List<KeyState> allKeys = Collections.synchronizedList(new ArrayList<>());
    private final List<KeyState> limitedKeys = Collections.synchronizedList(new ArrayList<>());
    private final AtomicInteger allKeysIndex = new AtomicInteger(0);
    private final AtomicInteger limitedKeysIndex = new AtomicInteger(0);
    private final Random random = new Random();

    @Autowired
    private GeminiApiProperties properties;

    // Initialize after properties are loaded
    public synchronized void ensureInitialized() {
        if (!allKeys.isEmpty() || !limitedKeys.isEmpty()) {
            return; // Already initialized
        }

        List<String> allKeysList = properties.resolveAllKeys();
        List<String> limitedKeysList = properties.resolveLimitedKeys();

        allKeysList.forEach(k -> allKeys.add(new KeyState(k)));
        limitedKeysList.forEach(k -> limitedKeys.add(new KeyState(k)));

        logger.info("GeminiKeyPool initialized: {} all-keys, {} limited-keys",
                allKeys.size(), limitedKeys.size());
    }

    /**
     * Get the appropriate key pool for a task type
     */
    public List<KeyState> keysFor(GeminiTask task) {
        if (task == GeminiTask.PLANNER) {
            return allKeys;
        }
        return limitedKeys;
    }

    /**
     * Try to acquire the next available key for a task
     * Returns null if no keys are available (all cooling down)
     */
    public String tryAcquire(GeminiTask task) {
        ensureInitialized();

        List<KeyState> pool = keysFor(task);
        if (pool.isEmpty()) {
            logger.warn("No Gemini API keys configured for task: {}", task);
            return null;
        }

        synchronized (pool) {
            long now = System.currentTimeMillis();
            int poolSize = pool.size();
            int startIndex = task == GeminiTask.PLANNER ?
                    allKeysIndex.getAndIncrement() :
                    limitedKeysIndex.getAndIncrement();

            // Try to find an available key (round-robin)
            for (int i = 0; i < poolSize; i++) {
                int idx = (startIndex + i) % poolSize;
                KeyState state = pool.get(idx);
                if (now >= state.nextAvailableAtMs) {
                    logger.debug("Acquired key for task {}: index {}", task, idx);
                    return state.key;
                }
            }

            logger.warn("No available Gemini API keys for task {}: all {} keys are cooling down",
                    task, poolSize);
            return null;
        }
    }

    /**
     * Mark key as successful - reset throttle counter
     */
    public void onSuccess(String key) {
        KeyState state = findKeyState(key);
        if (state != null) {
            state.consecutiveThrottles.set(0);
            state.nextAvailableAtMs = 0;
            logger.debug("Key success: throttle counter reset for {}", key.substring(0, 10) + "***");
        }
    }

    /**
     * Mark key as throttled (HTTP 429 / quota error)
     * Apply exponential backoff with jitter
     */
    public void onThrottle(String key) {
        KeyState state = findKeyState(key);
        if (state != null) {
            int consecutiveCount = state.consecutiveThrottles.incrementAndGet();
            long backoffMs = calculateBackoff(consecutiveCount);
            state.nextAvailableAtMs = System.currentTimeMillis() + backoffMs;
            logger.warn("Key throttled (attempt #{}): {} will be available in {}ms",
                    consecutiveCount, key.substring(0, 10) + "***", backoffMs);
        }
    }

    /**
     * Mark key as failed (non-throttle error) - light penalty
     */
    public void onFailure(String key) {
        // Light penalty: just mark as slightly unavailable (50-100ms)
        KeyState state = findKeyState(key);
        if (state != null) {
            long lightPenaltyMs = 50 + random.nextInt(50);
            state.nextAvailableAtMs = System.currentTimeMillis() + lightPenaltyMs;
            logger.debug("Key failed (light penalty): {} will be available in {}ms",
                    key.substring(0, 10) + "***", lightPenaltyMs);
        }
    }

    /**
     * Find a KeyState by its key string
     */
    private KeyState findKeyState(String key) {
        for (KeyState state : allKeys) {
            if (state.key.equals(key)) {
                return state;
            }
        }
        for (KeyState state : limitedKeys) {
            if (state.key.equals(key)) {
                return state;
            }
        }
        return null;
    }

    /**
     * Calculate exponential backoff with jitter and ceiling
     */
    private long calculateBackoff(int consecutiveThrottles) {
        int cooldownSeconds = properties.getCooldownSeconds();
        int initialBackoffMs = properties.getInitialBackoffMs();
        int maxBackoffMs = properties.getMaxBackoffMs();

        // Exponential: 2^n with jitter
        long exponential = (long) Math.pow(2, Math.min(consecutiveThrottles - 1, 10));
        long backoffMs = initialBackoffMs * exponential;
        backoffMs = Math.min(backoffMs, maxBackoffMs); // Apply ceiling

        // Add jitter: ±25%
        long jitter = (long) (backoffMs * 0.25 * (random.nextDouble() - 0.5) * 2);
        return Math.max(backoffMs + jitter, initialBackoffMs); // Don't go below initial
    }

    /**
     * Get pool statistics (for monitoring)
     */
    public String getPoolStats() {
        long now = System.currentTimeMillis();
        long allKeysAvailable = allKeys.stream()
                .filter(k -> now >= k.nextAvailableAtMs).count();
        long limitedKeysAvailable = limitedKeys.stream()
                .filter(k -> now >= k.nextAvailableAtMs).count();

        return String.format("KeyPool[all=%d/%d available, limited=%d/%d available]",
                allKeysAvailable, allKeys.size(),
                limitedKeysAvailable, limitedKeys.size());
    }
}


