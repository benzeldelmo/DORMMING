package com.dormming.domain.money;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * An amount of Philippine pesos, stored as whole centavos so splits never drift.
 * Encapsulation: the only state is a private long; every operation returns a new Money.
 */
public final class Money implements Comparable<Money> {

    public static final Money ZERO = new Money(0);

    private static final Pattern PESOS = Pattern.compile("\\d+(\\.\\d{1,2})?");

    private final long centavos;

    private Money(long centavos) {
        this.centavos = centavos;
    }

    public static Money ofCentavos(long centavos) {
        return new Money(centavos);
    }

    /** Parses what a person types, like "1,000.50" or "₱1000". Must be more than zero. */
    public static Money ofPesos(String text) {
        if (text == null) {
            throw new IllegalArgumentException("Enter an amount");
        }
        String cleaned = text.replace("₱", "").replace(",", "").replace(" ", "").strip();
        if (!PESOS.matcher(cleaned).matches()) {
            throw new IllegalArgumentException("Enter an amount like 150 or 1,000.50");
        }
        String[] parts = cleaned.split("\\.");
        long whole = Long.parseLong(parts[0]);
        long cents = parts.length == 1 ? 0 : Long.parseLong((parts[1] + "0").substring(0, 2));
        Money money = new Money(Math.addExact(Math.multiplyExact(whole, 100), cents));
        if (!money.isPositive()) {
            throw new IllegalArgumentException("Amount must be more than ₱0.00");
        }
        return money;
    }

    public long centavos() {
        return centavos;
    }

    public Money plus(Money other) {
        return new Money(Math.addExact(centavos, other.centavos));
    }

    public Money minus(Money other) {
        return new Money(Math.subtractExact(centavos, other.centavos));
    }

    public Money times(long factor) {
        return new Money(Math.multiplyExact(centavos, factor));
    }

    /** Splits into equal parts that add up exactly; leftover centavos go to the earliest parts. */
    public List<Money> divideEvenly(int parts) {
        if (parts <= 0) {
            throw new IllegalArgumentException("Cannot divide into " + parts + " parts");
        }
        long base = centavos / parts;
        long remainder = centavos % parts;
        List<Money> result = new ArrayList<>(parts);
        for (int i = 0; i < parts; i++) {
            result.add(new Money(base + (i < Math.abs(remainder) ? Long.signum(remainder) : 0)));
        }
        return result;
    }

    public boolean isZero() {
        return centavos == 0;
    }

    public boolean isPositive() {
        return centavos > 0;
    }

    public boolean isNegative() {
        return centavos < 0;
    }

    public String format() {
        long abs = Math.abs(centavos);
        return (centavos < 0 ? "-" : "") + String.format("₱%,d.%02d", abs / 100, abs % 100);
    }

    @Override
    public int compareTo(Money other) {
        return Long.compare(centavos, other.centavos);
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof Money m && m.centavos == centavos;
    }

    @Override
    public int hashCode() {
        return Long.hashCode(centavos);
    }

    @Override
    public String toString() {
        return format();
    }
}
