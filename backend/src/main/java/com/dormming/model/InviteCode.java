package com.dormming.model;

import java.util.Locale;
import java.util.random.RandomGenerator;

/** The 6-character code people type to join a dorm. No I, O, 0 or 1, so nothing looks alike. */
public record InviteCode(String value) {

    public static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 6;

    public InviteCode {
        String code = value == null ? "" : value.strip().toUpperCase(Locale.ROOT);
        if (code.length() != LENGTH || !code.chars().allMatch(ch -> ALPHABET.indexOf(ch) >= 0)) {
            throw new IllegalArgumentException("That dorm code isn't valid. It has 6 letters and numbers.");
        }
        value = code;
    }

    public static InviteCode parse(String text) {
        return new InviteCode(text);
    }

    public static InviteCode generate(RandomGenerator random) {
        StringBuilder code = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            code.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return new InviteCode(code.toString());
    }
}
