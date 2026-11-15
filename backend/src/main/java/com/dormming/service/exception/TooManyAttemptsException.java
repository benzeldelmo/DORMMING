package com.dormming.service.exception;

/** Too many failed tries in a short time (wrong passwords, sign-ups): the client must wait. HTTP 429. */
public class TooManyAttemptsException extends RuntimeException {
    public TooManyAttemptsException(String message) {
        super(message);
    }
}
