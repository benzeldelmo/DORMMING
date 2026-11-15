package com.dormming.model;

import java.util.Arrays;
import java.util.stream.Collectors;

/** A DormMing account. Immutable: a new photo gives a new User. */
public final class User {

    /** About 220 KB of image once decoded: plenty for a 256px profile photo. */
    private static final int MAX_PHOTO_CHARS = 300_000;

    private final UserId id;
    private final String email;
    private final String displayName;
    private final String photo; // a data: URL, or null for initials

    public User(UserId id, String email, String displayName) {
        this(id, email, displayName, null);
    }

    public User(UserId id, String email, String displayName, String photo) {
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
        this.photo = checkedPhoto(photo);
    }

    /** Only small JPEG, PNG or WebP images, sent as data URLs; null removes the photo. */
    private static String checkedPhoto(String photo) {
        if (photo == null) {
            return null;
        }
        if (photo.length() > MAX_PHOTO_CHARS) { // checked first, so a huge upload is turned away cheaply
            throw new IllegalArgumentException("That photo is too big");
        }
        if (!photo.matches("^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$")) {
            throw new IllegalArgumentException("Use a JPEG, PNG or WebP photo");
        }
        return photo;
    }

    public User withPhoto(String newPhoto) {
        return new User(id, email, displayName, newPhoto);
    }

    public String photo() {
        return photo;
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
