package com.dormming.auth;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Password hashes and reset tokens for local login. Kept in memory. */
@Component
@Profile("local")
public class CredentialStore {

    public record ResetToken(String email, Instant expiresAt) {
    }

    private final Map<String, String> hashes = new ConcurrentHashMap<>();
    private final Map<String, ResetToken> resets = new ConcurrentHashMap<>();

    public Optional<String> hashFor(String email) {
        return Optional.ofNullable(hashes.get(email.toLowerCase()));
    }

    public void setHash(String email, String hash) {
        hashes.put(email.toLowerCase(), hash);
    }

    public void remove(String email) {
        hashes.remove(email.toLowerCase());
    }

    public void saveReset(String token, ResetToken reset) {
        resets.put(token, reset);
    }

    /** Returns and removes the token, so it works only once. */
    public Optional<ResetToken> takeReset(String token) {
        return Optional.ofNullable(token == null ? null : resets.remove(token));
    }
}
