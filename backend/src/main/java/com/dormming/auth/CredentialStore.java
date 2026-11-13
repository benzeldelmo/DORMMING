package com.dormming.auth;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Password hashes for local login. Kept in memory. */
@Component
@Profile("local")
public class CredentialStore {

    private final Map<String, String> hashes = new ConcurrentHashMap<>();
    public Optional<String> hashFor(String email) {
        return Optional.ofNullable(hashes.get(email.toLowerCase()));
    }

    public void setHash(String email, String hash) {
        hashes.put(email.toLowerCase(), hash);
    }

    public void remove(String email) {
        hashes.remove(email.toLowerCase());
    }
}
