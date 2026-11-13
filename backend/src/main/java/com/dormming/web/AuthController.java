package com.dormming.web;

import com.dormming.auth.LocalAuthProvider;
import com.dormming.web.dto.AuthDtos.AuthResponse;
import com.dormming.web.dto.AuthDtos.LoginRequest;
import com.dormming.web.dto.AuthDtos.RegisterRequest;
import com.dormming.web.dto.MeDto;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Local login only. With Supabase, the app signs in through Supabase directly. */
@RestController
@RequestMapping("/api/auth")
@Profile("local")
public class AuthController {

    private final LocalAuthProvider auth;

    public AuthController(LocalAuthProvider auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    AuthResponse register(@RequestBody RegisterRequest req) {
        var result = auth.register(req.email(), req.password(), req.displayName());
        return new AuthResponse(result.token(), MeDto.of(result.user(), null));
    }

    @PostMapping("/login")
    AuthResponse login(@RequestBody LoginRequest req) {
        var result = auth.login(req.email(), req.password());
        return new AuthResponse(result.token(), MeDto.of(result.user(), null));
    }
}
