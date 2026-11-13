package com.dormming.web.dto;

import com.dormming.domain.user.User;

public record MeDto(String id, String email, String displayName, String initials, String dormId) {

    public static MeDto of(User user, String dormId) {
        return new MeDto(user.id().value(), user.email(), user.displayName(), user.initials(), dormId);
    }
}
