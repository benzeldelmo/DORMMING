package com.dormming.service;

import com.dormming.service.exception.TooManyAttemptsException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Rate limiting for logins and sign-ups: remembers recent failures per key (like "login:email|ip") and
 * refuses more tries once a key has too many within a time window. Slows down password guessing.
 */
@Component
public class AttemptLimiter {

    private final Clock clock;
    private final Map<String, Deque<Instant>> failures = new ConcurrentHashMap<>();

    public AttemptLimiter(Clock clock) {
        this.clock = clock;
    }

    /** Throws TooManyAttemptsException when {@code key} already failed {@code max} times within {@code window}. */
    public void check(String key, int max, Duration window) {
        Deque<Instant> recent = failures.get(key);
        if (recent == null) {
            return;
        }
        Instant now = clock.instant();
        synchronized (recent) {
            while (!recent.isEmpty() && !recent.peekFirst().isAfter(now.minus(window))) {
                recent.pollFirst(); // older than the window: forgiven
            }
            if (recent.isEmpty()) {
                failures.remove(key, recent);
                return;
            }
            if (recent.size() >= max) {
                long seconds = Duration.between(now, recent.peekFirst().plus(window)).toSeconds();
                long minutes = Math.max(1, (seconds + 59) / 60);
                throw new TooManyAttemptsException("Too many tries. Wait " + minutes + (minutes == 1 ? " minute" : " minutes") + " and try again.");
            }
        }
    }

    public void fail(String key) {
        Deque<Instant> recent = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (recent) {
            recent.addLast(clock.instant());
        }
    }

    /** A success forgets the key's failures. */
    public void succeed(String key) {
        failures.remove(key);
    }
}
