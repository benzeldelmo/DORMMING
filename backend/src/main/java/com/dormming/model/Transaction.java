package com.dormming.model;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;

/**
 * Abstraction: every money record (a shared expense or a payment) shares these fields
 * and describes itself in its own way.
 */
public abstract class Transaction {

    private final String id;
    private final String dormId;
    private final Money amount;
    private final LocalDate date;
    private final UserId createdBy;
    private final String note;
    private final Instant createdAt;

    protected Transaction(String id, String dormId, Money amount, LocalDate date, UserId createdBy, String note,
            Instant createdAt) {
        if (amount == null || !amount.isPositive()) {
            throw new IllegalArgumentException("Amount must be more than ₱0.00");
        }
        if (date == null) {
            throw new IllegalArgumentException("Pick a date");
        }
        if (createdBy == null) {
            throw new IllegalArgumentException("Missing who made this record");
        }
        if (note != null && note.length() > 200) {
            throw new IllegalArgumentException("Notes can be up to 200 characters");
        }
        this.id = id == null ? UUID.randomUUID().toString() : id;
        this.dormId = dormId;
        this.amount = amount;
        this.date = date;
        this.createdBy = createdBy;
        this.note = note == null ? "" : note.strip();
        this.createdAt = createdAt == null ? Instant.now() : createdAt;
    }

    public abstract String describe(Function<UserId, String> nameOf);

    public String id() {
        return id;
    }

    public String dormId() {
        return dormId;
    }

    public Money amount() {
        return amount;
    }

    public LocalDate date() {
        return date;
    }

    public UserId createdBy() {
        return createdBy;
    }

    public String note() {
        return note;
    }

    public Instant createdAt() {
        return createdAt;
    }

    /** "Benzel", "Benzel and Sydney", "Benzel, Vince and Sydney". */
    protected static String joinNames(List<String> names) {
        if (names.isEmpty()) {
            return "nobody";
        }
        if (names.size() == 1) {
            return names.getFirst();
        }
        return String.join(", ", names.subList(0, names.size() - 1)) + " and " + names.getLast();
    }
}
