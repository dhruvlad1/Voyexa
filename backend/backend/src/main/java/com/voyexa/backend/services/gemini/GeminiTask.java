package com.voyexa.backend.services.gemini;

/**
 * Enum to mark task type for Gemini API calls.
 * Determines which key pool to use (master or limited).
 */
public enum GeminiTask {
    /**
     * PLANNER: Uses full key pool (all 10 keys)
     * Task type: Trip generation planning
     */
    PLANNER,

    /**
     * VALIDATOR: Uses limited key pool (2-3 keys)
     * Task type: Validation of planner output
     */
    VALIDATOR,

    /**
     * AUXILIARY: Uses limited key pool (2-3 keys)
     * Task type: Dashboard, on-demand alternatives, other supporting tasks
     */
    AUXILIARY
}

