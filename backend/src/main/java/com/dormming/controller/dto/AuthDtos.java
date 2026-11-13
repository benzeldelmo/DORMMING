package com.dormming.controller.dto;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(String email, String password, String displayName) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record AuthResponse(String token, MeDto user) {
    }
}
