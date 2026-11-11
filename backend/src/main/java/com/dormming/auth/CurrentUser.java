package com.dormming.auth;

import com.dormming.domain.user.UserId;
import org.springframework.security.oauth2.jwt.Jwt;

public final class CurrentUser {
    private CurrentUser() {
    }

    public static UserId id(Jwt jwt) {
        return new UserId(jwt.getSubject());
    }
}
