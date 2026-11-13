package com.dormming.controller;

import com.dormming.controller.dto.AuthDtos.AuthResponse;
import com.dormming.controller.dto.AuthDtos.LoginRequest;
import com.dormming.controller.dto.AuthDtos.RegisterRequest;
import com.dormming.controller.dto.MeDto;
import com.dormming.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Register and log in. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
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
