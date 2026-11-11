package com.dormming.domain.dorm;

import com.dormming.domain.Codes;
import java.util.random.RandomGenerator;

/** The 6-character code people type or scan to join a dorm. */
public record InviteCode(String value) {
    public InviteCode {
        value = Codes.normalize(value, 6, "dorm code");
    }

    public static InviteCode parse(String text) {
        return new InviteCode(text);
    }

    public static InviteCode generate(RandomGenerator random) {
        return new InviteCode(Codes.generate(random, 6));
    }
}
