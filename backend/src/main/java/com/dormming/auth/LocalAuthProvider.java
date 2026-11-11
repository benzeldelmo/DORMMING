package com.dormming.auth;

import com.dormming.domain.user.CardColor;
import com.dormming.domain.user.FriendCode;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.UserRepository;
import com.dormming.service.UnauthorizedException;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.random.RandomGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Component;

/** Login without Supabase: passwords hashed with BCrypt, tokens signed by this server. */
@Component
@Profile("local")
public class LocalAuthProvider implements AuthProvider {

    public record AuthResult(String token, User user) {
    }

    private static final String WRONG = "Wrong email or password";

    private final UserRepository users;
    private final CredentialStore credentials;
    private final PasswordEncoder passwords;
    private final RandomGenerator random;
    private final Clock clock;
    private final SecretKey key;
    private final NimbusJwtEncoder encoder;

    public LocalAuthProvider(UserRepository users, CredentialStore credentials, PasswordEncoder passwords,
            RandomGenerator random, Clock clock, @Value("${dormming.local-jwt-secret}") String secret) {
        if (secret.length() < 32) {
            throw new IllegalStateException("LOCAL_JWT_SECRET must be at least 32 characters");
        }
        this.users = users;
        this.credentials = credentials;
        this.passwords = passwords;
        this.random = random;
        this.clock = clock;
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.encoder = NimbusJwtEncoder.withSecretKey(key).build();
    }

    @Override
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }

    @Override
    public String name() {
        return "local";
    }

    public AuthResult register(String email, String password, String displayName) {
        checkPassword(password);
        if (email == null || users.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException(email == null ? "Enter your email" : "That email already has an account");
        }
        User user = users.save(new User(new UserId(UUID.randomUUID().toString()), email, displayName, null,
                CardColor.OLIVE, FriendCode.generate(random)));
        credentials.setHash(user.email(), passwords.encode(password));
        return new AuthResult(tokenFor(user), user);
    }

    public AuthResult login(String email, String password) {
        if (email == null || password == null) {
            throw new UnauthorizedException(WRONG);
        }
        User user = users.findByEmail(email).orElseThrow(() -> new UnauthorizedException(WRONG));
        String hash = credentials.hashFor(user.email()).orElseThrow(() -> new UnauthorizedException(WRONG));
        if (!passwords.matches(password, hash)) {
            throw new UnauthorizedException(WRONG);
        }
        return new AuthResult(tokenFor(user), user);
    }

    /** Demo mode: the token is returned instead of emailed. Unknown emails still get a (useless) token. */
    public String startReset(String email) {
        String token = UUID.randomUUID().toString();
        if (email != null && users.findByEmail(email).isPresent()) {
            credentials.saveReset(token, new CredentialStore.ResetToken(email.strip().toLowerCase(),
                    clock.instant().plus(Duration.ofMinutes(30))));
        }
        return token;
    }

    public void finishReset(String resetToken, String newPassword) {
        checkPassword(newPassword);
        CredentialStore.ResetToken reset = credentials.takeReset(resetToken)
                .filter(r -> r.expiresAt().isAfter(clock.instant()))
                .orElseThrow(() -> new IllegalArgumentException("That reset link has expired or was already used"));
        credentials.setHash(reset.email(), passwords.encode(newPassword));
    }

    private static void checkPassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
    }

    private String tokenFor(User user) {
        // Signed with the real clock: the decoder checks expiry against system time.
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("dormming-local").subject(user.id().value())
                .claim("email", user.email()).issuedAt(now).expiresAt(now.plus(Duration.ofDays(7))).build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }
}
