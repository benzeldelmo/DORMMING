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
import org.springframework.security.oauth2.jwt.JwtDecoder;
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

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final Map<String, String> hashByEmail = new ConcurrentHashMap<>();
    private final SecretKey key;
    private final NimbusJwtEncoder encoder;

    public AuthService(UserRepository users, PasswordEncoder passwords,
            @Value("${dormming.local-jwt-secret}") String secret) {
        if (secret.length() < 32) {
            throw new IllegalStateException("LOCAL_JWT_SECRET must be at least 32 characters");
        }
        this.users = users;
        this.passwords = passwords;
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = NimbusJwtEncoder.withSecretKey(key).build();
    }

    /** Checks the login token on every request. */
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
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
        User user = users.findByEmail(email).orElseThrow(() -> new UnauthorizedException(WRONG));
        String hash = hashByEmail.get(user.email());
        if (hash == null || !passwords.matches(password, hash)) {
            throw new UnauthorizedException(WRONG);
        }
        return new AuthResult(tokenFor(user), user);
    }

    private String tokenFor(User user) {
        Instant now = Instant.now(); // the decoder checks expiry against the real clock
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("dormming").subject(user.id().value())
                .issuedAt(now).expiresAt(now.plus(Duration.ofDays(7))).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }
}
