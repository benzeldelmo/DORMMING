package com.dormming.model;

/** Identifies a user. A record keeps it immutable and comparable by value. */
public record UserId(String value) {
    public UserId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
