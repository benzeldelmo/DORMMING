package com.dormming.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.function.Function;

/** One dormmate paying another back. Simulated: no real money moves. */
public class Payment extends Transaction {

    private final UserId from;
    private final UserId to;

    public Payment(String id, String dormId, UserId from, UserId to, Money amount, LocalDate date, String note,
            Instant createdAt) {
        super(id, dormId, amount, date, from, note, createdAt);
        if (to == null) {
            throw new IllegalArgumentException("Pick who you're paying");
        }
        if (from.equals(to)) {
            throw new IllegalArgumentException("You can't pay yourself");
        }
        this.from = from;
        this.to = to;
    }

    public UserId from() {
        return from;
    }

    public UserId to() {
        return to;
    }

    @Override
    public String describe(Function<UserId, String> nameOf) {
        return nameOf.apply(from) + " paid " + nameOf.apply(to) + " " + amount().format();
    }
}
