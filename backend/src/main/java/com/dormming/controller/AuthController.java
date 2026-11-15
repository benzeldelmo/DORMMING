package com.dormming.controller;

import com.dormming.controller.dto.AuthDtos.AuthResponse;
import com.dormming.controller.dto.AuthDtos.LoginRequest;
import com.dormming.controller.dto.AuthDtos.RegisterRequest;
import com.dormming.controller.dto.MeDto;
import com.dormming.service.AttemptLimiter;
import com.dormming.service.AuthService;
import com.dormming.service.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Register and log in, rate-limited against password guessing:
 * - 5 wrong passwords for one email from one address, then wait 15 minutes;
 * - 20 wrong passwords for one email from anywhere, then wait 15 minutes;
 * - 10 sign-ups from one address an hour.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Duration LOGIN_WINDOW = Duration.ofMinutes(15);
    private static final Duration SIGNUP_WINDOW = Duration.ofHours(1);

    private final AuthService auth;
    private final AttemptLimiter limiter;

    public AuthController(AuthService auth, AttemptLimiter limiter) {
        this.auth = auth;
        this.limiter = limiter;
    }

    @PostMapping("/register")
    AuthResponse register(@RequestBody RegisterRequest req, HttpServletRequest http) {
        String key = "signup:" + http.getRemoteAddr();
        limiter.check(key, 10, SIGNUP_WINDOW);
        limiter.fail(key); // every sign-up counts towards the hourly limit, successful or not
        var result = auth.register(req.email(), req.password(), req.displayName());
        return new AuthResponse(result.token(), MeDto.of(result.user(), null));
    }

    @PostMapping("/login")
    AuthResponse login(@RequestBody LoginRequest req, HttpServletRequest http) {
        String email = req.email() == null ? "" : req.email().strip().toLowerCase();
        String fromHere = "login:" + email + "|" + http.getRemoteAddr();
        String anywhere = "login:" + email;
        limiter.check(fromHere, 5, LOGIN_WINDOW);
        limiter.check(anywhere, 20, LOGIN_WINDOW);
        try {
            var result = auth.login(req.email(), req.password());
            limiter.succeed(fromHere);
            limiter.succeed(anywhere);
            return new AuthResponse(result.token(), MeDto.of(result.user(), null));
        } catch (UnauthorizedException wrong) {
            limiter.fail(fromHere);
            limiter.fail(anywhere);
            throw wrong;
        }
    }
}
