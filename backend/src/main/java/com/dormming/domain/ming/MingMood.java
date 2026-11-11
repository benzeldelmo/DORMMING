package com.dormming.domain.ming;

import com.dormming.domain.money.Money;

/** Ming's expression, picked from the user's money situation. */
public enum MingMood {
    HAPPY("%s is happy. You're all square!"),
    WORRIED("%s is a little worried. Something needs paying."),
    CELEBRATING("%s is celebrating. You settled up!"),
    SLEEPY("%s is napping. Nothing new this week.");

    private final String template;

    MingMood(String template) {
        this.template = template;
    }

    public String line(String mingName) {
        return template.formatted(mingName);
    }

    /** Priority: worried, then celebrating, then sleepy, else happy. */
    public static MingMood of(Money youOwe, boolean billDueWithin2Days, boolean settledInLast24h,
            boolean activeInLast7Days) {
        if (youOwe.isPositive() || billDueWithin2Days) {
            return WORRIED;
        }
        if (settledInLast24h) {
            return CELEBRATING;
        }
        if (!activeInLast7Days) {
            return SLEEPY;
        }
        return HAPPY;
    }
}
