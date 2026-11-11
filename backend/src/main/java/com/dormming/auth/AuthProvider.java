package com.dormming.auth;

import org.springframework.security.oauth2.jwt.JwtDecoder;

/** Polymorphism: where login tokens come from. Local signs its own; Supabase issues them. */
public interface AuthProvider {
    JwtDecoder jwtDecoder();

    String name();
}
