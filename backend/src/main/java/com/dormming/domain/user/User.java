package com.dormming.domain.user;

import java.util.Arrays;
import java.util.stream.Collectors;

/** A DormMing account. Immutable. */
public final class User {

    private final UserId id;
    private final String email;
    private final String displayName;

    public User(UserId id, String email, String displayName) {
        if (id == null) {
            throw new IllegalArgumentException("User needs an id");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Enter a valid email");
        }
        String name = displayName == null ? "" : displayName.strip();
        if (name.isEmpty() || name.length() > 40) {
            throw new IllegalArgumentException("Your name must be 1 to 40 characters");
        }
        this.id = id;
        this.email = email.strip().toLowerCase();
        this.displayName = name;
    }

    public UserId id() {
        return id;
    }

    public String email() {
        return email;
    }

    public String displayName() {
        return displayName;
    }

    /** "Benzel Delmo" becomes "BD". */
    public String initials() {
        return Arrays.stream(displayName.split("\\s+")).limit(2)
                .map(word -> word.substring(0, 1).toUpperCase()).collect(Collectors.joining());
    }
}
