package com.dormming.controller.dto;

import com.dormming.model.User;

public record MeDto(String id, String email, String displayName, String initials, String dormId) {

    public static MeDto of(User user, String dormId) {
        return new MeDto(user.id().value(), user.email(), user.displayName(), user.initials(), dormId);
    }
}
