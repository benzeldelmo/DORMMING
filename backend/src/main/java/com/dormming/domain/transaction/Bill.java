package com.dormming.domain.transaction;

import com.dormming.domain.money.Money;
import com.dormming.domain.recurrence.Recurrence;
import com.dormming.domain.split.SplitStrategy;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.function.Function;

/**
 * A dorm bill (internet, water, rent). Each member pays their own share to the provider
 * and marks it paid, so bills never create debts between members.
 */
public class Bill extends Transaction {

    private static final DateTimeFormatter DUE = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

    private final String name;
    private final Category category;
    private final Recurrence recurrence;
    private final int remindDaysBefore;
    private final List<BillShare> shares;
    private boolean rolledOver;

    public Bill(String id, String dormId, UserId createdBy, String name, Category category, Money amount,
            LocalDate dueDate, Recurrence recurrence, int remindDaysBefore, List<BillShare> shares, boolean rolledOver,
            Instant createdAt) {
        super(id, dormId, amount, dueDate, createdBy, "", createdAt);
        if (name == null || name.isBlank() || name.strip().length() > 40) {
            throw new IllegalArgumentException("Bill name must be 1 to 40 characters");
        }
        if (category == null || recurrence == null) {
            throw new IllegalArgumentException("Pick a category and how it repeats");
        }
        if (remindDaysBefore < 0 || remindDaysBefore > 30) {
            throw new IllegalArgumentException("Reminder must be 0 to 30 days before");
        }
        if (shares.stream().mapToLong(s -> s.amount().centavos()).sum() != amount.centavos()) {
            throw new IllegalArgumentException("Shares must add up to the bill amount");
        }
        this.name = name.strip();
        this.category = category;
        this.recurrence = recurrence;
        this.remindDaysBefore = remindDaysBefore;
        this.shares = List.copyOf(shares);
        this.rolledOver = rolledOver;
    }

    public static Bill create(String id, String dormId, UserId createdBy, String name, Category category, Money amount,
            LocalDate dueDate, Recurrence recurrence, int remindDaysBefore, List<UserId> members,
            SplitStrategy strategy, Instant createdAt) {
        List<BillShare> shares = strategy.split(amount, members, null).entrySet().stream()
                .map(e -> new BillShare(e.getKey(), e.getValue(), null))
                .toList();
        return new Bill(id, dormId, createdBy, name, category, amount, dueDate, recurrence, remindDaysBefore, shares,
                false, createdAt);
    }

    public String name() {
        return name;
    }

    public Category category() {
        return category;
    }

    public LocalDate dueDate() {
        return date();
    }

    public Recurrence recurrence() {
        return recurrence;
    }

    public int remindDaysBefore() {
        return remindDaysBefore;
    }

    public List<BillShare> shares() {
        return shares;
    }

    public Optional<BillShare> shareOf(UserId user) {
        return shares.stream().filter(s -> s.userId().equals(user)).findFirst();
    }

    public void markPaid(UserId user, Instant when) {
        shareOf(user).orElseThrow(() -> new IllegalArgumentException("You don't have a share in this bill"))
                .markPaid(when);
    }

    public boolean isFullyPaid() {
        return shares.stream().allMatch(BillShare::isPaid);
    }

    private boolean isUnpaidFor(UserId user) {
        return shareOf(user).map(s -> !s.isPaid()).orElse(false);
    }

    public boolean isOverdueFor(UserId user, LocalDate today) {
        return isUnpaidFor(user) && today.isAfter(dueDate());
    }

    /** Unpaid and due on or before {@code today + days}; overdue counts too. */
    public boolean isDueWithin(UserId user, LocalDate today, int days) {
        return isUnpaidFor(user) && !dueDate().isAfter(today.plusDays(days));
    }

    public boolean isRolledOver() {
        return rolledOver;
    }

    public void markRolledOver() {
        this.rolledOver = true;
    }

    /** The next bill in the series, with the same shares, all unpaid. */
    public Optional<Bill> nextInstance(Instant now) {
        return recurrence.next(dueDate()).map(nextDue -> new Bill(null, dormId(), createdBy(), name, category, amount(),
                nextDue, recurrence, remindDaysBefore,
                shares.stream().map(s -> new BillShare(s.userId(), s.amount(), null)).toList(), false, now));
    }

    @Override
    public TransactionType type() {
        return TransactionType.BILL;
    }

    @Override
    public String describe(Function<UserId, String> nameOf) {
        return name + " bill " + amount().format() + " due " + DUE.format(dueDate());
    }
}
