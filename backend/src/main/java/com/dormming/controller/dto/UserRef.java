package com.dormming.controller.dto;

import com.dormming.model.User;

public record UserRef(String id, String displayName, String initials) {
    public static UserRef of(User user) {
        return new UserRef(user.id().value(), user.displayName(), user.initials());
    }
}
