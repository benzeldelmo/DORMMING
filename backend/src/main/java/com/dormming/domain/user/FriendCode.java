package com.dormming.domain.user;

import com.dormming.domain.Codes;
import java.util.random.RandomGenerator;

/** The 8-character code behind a digital card's QR. */
public record FriendCode(String value) {
    public FriendCode {
        value = Codes.normalize(value, 8, "friend code");
    }

    public static FriendCode parse(String text) {
        return new FriendCode(text);
    }

    public static FriendCode generate(RandomGenerator random) {
        return new FriendCode(Codes.generate(random, 8));
    }
}
