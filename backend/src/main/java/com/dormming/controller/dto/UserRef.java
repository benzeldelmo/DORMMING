package com.dormming.controller.dto;

import com.dormming.model.User;

public record UserRef(String id, String displayName, String initials, String photo) {
    /** Name and initials only: used in expenses, payments and balances (sent every few seconds). */
    public static UserRef of(User user) {
        return new UserRef(user.id().value(), user.displayName(), user.initials(), null);
    }

    /** With the profile photo: only in the dorm's member list, so photos aren't repeated in every row. */
    public static UserRef withPhoto(User user) {
        return new UserRef(user.id().value(), user.displayName(), user.initials(), user.photo());
    }
}
