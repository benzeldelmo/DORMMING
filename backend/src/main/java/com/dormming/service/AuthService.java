package com.dormming.service;

import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.repository.UserRepository;
import com.dormming.service.exception.UnauthorizedException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

/** Register and log in. Passwords are hashed with BCrypt; login tokens are signed by this server. */
@Service
public class AuthService {

    public record AuthResult(String token, User user) {
    }

    private static final String WRONG = "Wrong email or password";

    /** A real hash of a random string, checked against when the email doesn't exist (see login). */
    private final String timingDummy;

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final Map<String, String> hashByEmail = new ConcurrentHashMap<>();
    private final SecretKey key;
    private final NimbusJwtEncoder encoder;

    public AuthService(UserRepository users, PasswordEncoder passwords,
            @Value("${dormming.local-jwt-secret}") String secret, @Value("${dormming.require-https}") boolean requireHttps) {
        if (requireHttps && secret.startsWith("dormming-local-dev-secret")) {
            throw new IllegalStateException("Set LOCAL_JWT_SECRET to your own random value before deploying");
        }
        if (secret.length() < 32) {
            throw new IllegalStateException("LOCAL_JWT_SECRET must be at least 32 characters");
        }
        this.users = users;
        this.timingDummy = passwords.encode(UUID.randomUUID().toString());
        this.passwords = passwords;
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = NimbusJwtEncoder.withSecretKey(key).build();
    }

    /** Checks the login token on every request. */
    /**
     * Checks a token's signature and expiry, and that its user still exists: after an account is
     * deleted, a token still saved on another phone stops working at once instead of in 90 days.
     */
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        OAuth2TokenValidator<Jwt> userExists = jwt -> users.findById(new UserId(jwt.getSubject())).isPresent()
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Please log in again", null));
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), userExists));
        return decoder;
    }

    // synchronized: two sign-ups with the same email at once must not both succeed.
    public synchronized AuthResult register(String email, String password, String displayName) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (email == null || users.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(email == null ? "Enter your email" : "That email already has an account");
        }
        User user = users.save(new User(new UserId(UUID.randomUUID().toString()), email, displayName));
        hashByEmail.put(user.email(), passwords.encode(password));
        return new AuthResult(tokenFor(user), user);
    }

    public AuthResult login(String email, String password) {
        if (email == null || password == null) {
            throw new UnauthorizedException(WRONG);
        }
        User user = users.findByEmail(email).orElse(null);
        if (user == null) {
            // Same work as a wrong password, so the response time doesn't reveal which emails have accounts
            passwords.matches(password, timingDummy);
            throw new UnauthorizedException(WRONG);
        }
        String hash = hashByEmail.get(user.email());
        if (hash == null || !passwords.matches(password, hash)) {
            throw new UnauthorizedException(WRONG);
        }
        return new AuthResult(tokenFor(user), user);
    }

    /** Forgets a deleted account's password, so its email can sign up again. */
    public void forget(String email) {
        hashByEmail.remove(email.strip().toLowerCase());
    }

    private String tokenFor(User user) {
        Instant now = Instant.now(); // the decoder checks expiry against the real clock
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("dormming").subject(user.id().value())
                .issuedAt(now).expiresAt(now.plus(Duration.ofDays(90))).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }
}
