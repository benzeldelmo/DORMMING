package com.dormming.domain;

import java.util.Locale;
import java.util.random.RandomGenerator;

/** Short codes people type or scan. No I, O, 0 or 1, so nothing looks alike. */
public final class Codes {

    public static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private Codes() {
    }

    public static String generate(RandomGenerator random, int length) {
        StringBuilder code = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            code.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }

    public static String normalize(String text, int length, String what) {
        String code = text == null ? "" : text.strip().toUpperCase(Locale.ROOT);
        if (code.length() != length || !code.chars().allMatch(ch -> ALPHABET.indexOf(ch) >= 0)) {
            throw new IllegalArgumentException("That " + what + " isn't valid. It has " + length + " letters and numbers.");
        }
        return code;
    }
}
