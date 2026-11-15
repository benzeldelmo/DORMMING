package com.dormming.model;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

/**
 * A personal payment reminder: something you have to pay (internet, water, a phone plan),
 * how much, and when. Only its owner sees it. A monthly bill comes back next month once paid.
 * Immutable: paying returns the next one. {@code day} is the day of the month it was set for (the 31st
 * stays the 31st even after a 28-day February).
 */
public record Bill(String id, UserId owner, String name, Money amount, LocalDate dueDate, boolean monthly, int day) {

    /** A new bill: its day of the month comes from its first due date. */
    public Bill(String id, UserId owner, String name, Money amount, LocalDate dueDate, boolean monthly) {
        this(id, owner, name, amount, dueDate, monthly, dueDate == null ? 1 : dueDate.getDayOfMonth());
    }

    public Bill {
        if (owner == null) {
            throw new IllegalArgumentException("Missing who the bill belongs to");
        }
        name = name == null ? "" : name.strip();
        if (name.isEmpty() || name.length() > 40) {
            throw new IllegalArgumentException(name.isEmpty() ? "Give the bill a name" : "Bill names can be up to 40 characters");
        }
        if (amount == null || !amount.isPositive()) {
            throw new IllegalArgumentException("Amount must be more than ₱0.00");
        }
        if (dueDate == null) {
            throw new IllegalArgumentException("Pick a due date");
        }
        id = id == null ? UUID.randomUUID().toString() : id;
    }

    /**
     * The next time this monthly bill is due after {@code today}: one month on, on its own day (or the
     * month's last day when the month is shorter). Paid months late, it skips ahead past today.
     */
    public Bill nextAfter(LocalDate today) {
        LocalDate next = dueDate;
        do {
            YearMonth month = YearMonth.from(next).plusMonths(1);
            next = month.atDay(Math.min(day, month.lengthOfMonth()));
        } while (!next.isAfter(today));
        return new Bill(id, owner, name, amount, next, monthly, day);
    }
}
