package com.dormming.domain.user;

import java.util.Arrays;
import java.util.stream.Collectors;

/** A DormMing account's profile. Immutable: changes return a new User. */
public final class User {

    private final UserId id;
    private final String email;
    private final String displayName;
    private final String mingName;
    private final CardColor cardColor;
    private final FriendCode friendCode;

    public User(UserId id, String email, String displayName, String mingName, CardColor cardColor,
            FriendCode friendCode) {
        if (id == null || friendCode == null) {
            throw new IllegalArgumentException("User needs an id and friend code");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Enter a valid email");
        }
        String name = displayName == null ? "" : displayName.strip();
        if (name.isEmpty() || name.length() > 40) {
            throw new IllegalArgumentException("Your name must be 1 to 40 characters");
        }
        String ming = mingName == null || mingName.isBlank() ? "Ming" : mingName.strip();
        if (ming.length() > 20) {
            throw new IllegalArgumentException("Ming's name can be up to 20 characters");
        }
        this.id = id;
        this.email = email.strip().toLowerCase();
        this.displayName = name;
        this.mingName = ming;
        this.cardColor = cardColor == null ? CardColor.OLIVE : cardColor;
        this.friendCode = friendCode;
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

    public String mingName() {
        return mingName;
    }

    public CardColor cardColor() {
        return cardColor;
    }

    public FriendCode friendCode() {
        return friendCode;
    }

    public String initials() {
        return Arrays.stream(displayName.split("\\s+")).limit(2)
                .map(word -> word.substring(0, 1).toUpperCase()).collect(Collectors.joining());
    }

    public User withDisplayName(String name) {
        return new User(id, email, name, mingName, cardColor, friendCode);
    }

    public User withMingName(String name) {
        return new User(id, email, displayName, name, cardColor, friendCode);
    }

    public User withCardColor(CardColor color) {
        return new User(id, email, displayName, mingName, color, friendCode);
    }
}
