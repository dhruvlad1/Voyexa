package com.voyexa.backend.exceptions;

import java.util.Map;

public class DuplicateUserException extends RuntimeException {
    private final Map<String, String> fieldErrors;

    public DuplicateUserException(Map<String, String> fieldErrors) {
        super("User already exists with the provided details.");
        this.fieldErrors = fieldErrors;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}

