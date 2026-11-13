package com.dormming.model;

import com.dormming.model.split.ItemizedSplit;
import com.dormming.model.split.ReceiptItem;
import com.dormming.model.split.SplitStrategy;
import com.dormming.model.split.SplitType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/** Money one dormmate paid for several people. Everyone else owes the payer their share. */
public class SharedExpense extends Transaction {

    private final Category category;
    private final UserId payer;
    private final Map<UserId, Money> shares;
    private final SplitType splitType;
    private final List<ReceiptItem> items;
    private final Money extras;

    /** Rebuilds a saved expense whose shares were already worked out. */
    public SharedExpense(String id, String dormId, UserId createdBy, Money amount, LocalDate date, String note,
            Category category, UserId payer, Map<UserId, Money> shares, SplitType splitType, List<ReceiptItem> items,
            Money extras, Instant createdAt) {
        super(id, dormId, amount, date, createdBy, note, createdAt);
        if (category == null) {
            throw new IllegalArgumentException("Pick a category");
        }
        if (payer == null) {
            throw new IllegalArgumentException("Pick who paid");
        }
        long sum = shares.values().stream().mapToLong(Money::centavos).sum();
        if (sum != amount.centavos()) {
            throw new IllegalArgumentException("Shares must add up to the total");
        }
        this.category = category;
        this.payer = payer;
        this.shares = new LinkedHashMap<>(shares);
        this.splitType = splitType;
        this.items = items == null ? List.of() : List.copyOf(items);
        this.extras = extras == null ? Money.ZERO : extras;
    }

    /** Works out the shares with the chosen strategy. */
    public static SharedExpense create(String id, String dormId, UserId createdBy, Money amount, LocalDate date,
            String note, Category category, UserId payer, List<UserId> participants, SplitStrategy strategy,
            Instant createdAt) {
        Map<UserId, Money> shares = strategy.split(amount, participants, payer);
        List<ReceiptItem> items = strategy instanceof ItemizedSplit itemized ? itemized.items() : List.of();
        Money extras = strategy instanceof ItemizedSplit itemized ? itemized.extras() : Money.ZERO;
        return new SharedExpense(id, dormId, createdBy, amount, date, note, category, payer, shares, strategy.type(),
                items, extras, createdAt);
    }

    public Category category() {
        return category;
    }

    public UserId payer() {
        return payer;
    }

    public Map<UserId, Money> shares() {
        return Map.copyOf(shares);
    }

    public List<UserId> participants() {
        return List.copyOf(shares.keySet());
    }

    public SplitType splitType() {
        return splitType;
    }

    public List<ReceiptItem> items() {
        return items;
    }

    public Money extras() {
        return extras;
    }

    /** What each participant other than the payer owes the payer. */
    public Map<UserId, Money> debtsToPayer() {
        Map<UserId, Money> debts = new LinkedHashMap<>();
        shares.forEach((person, share) -> {
            if (!person.equals(payer) && share.isPositive()) {
                debts.put(person, share);
            }
        });
        return debts;
    }

    @Override
    public String describe(Function<UserId, String> nameOf) {
        String what = note().isEmpty() ? category.label() : note();
        List<String> others = shares.keySet().stream().filter(p -> !p.equals(payer)).map(nameOf).toList();
        return nameOf.apply(payer) + " paid " + amount().format() + " for " + what + ", shared with " + joinNames(others);
    }
}
