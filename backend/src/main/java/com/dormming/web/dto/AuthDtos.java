package com.dormming.web.dto;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(String email, String password, String displayName) {
    }

    public record LoginRequest(String email, String password) {
    }

    public record ForgotRequest(String email) {
    }

    public record ForgotResponse(String resetToken) {
    }

    public record ResetRequest(String resetToken, String password) {
    }

    public record AuthResponse(String token, MeDto user) {
    }

    public record ProfilePatch(String displayName, String mingName, String cardColor) {
    }
}
