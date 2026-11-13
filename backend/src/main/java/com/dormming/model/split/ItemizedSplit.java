package com.dormming.model.split;

import com.dormming.model.Money;
import com.dormming.model.UserId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thermal receipt split: each person pays for the items they shared, and the extras line
 * (tax, service, tip, or a negative discount) is shared in proportion to those items.
 */
public class ItemizedSplit implements SplitStrategy {

    private final List<ReceiptItem> items;
    private final Money extras;

    public ItemizedSplit(List<ReceiptItem> items, Money extras) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Add at least one item");
        }
        this.items = List.copyOf(items);
        this.extras = extras == null ? Money.ZERO : extras;
    }

    public List<ReceiptItem> items() {
        return items;
    }

    public Money extras() {
        return extras;
    }

    /** Each person's total for their items before extras, in {@code people} order. */
    public Map<UserId, Money> itemSubtotals(List<UserId> people, UserId payer) {
        Map<UserId, Money> subtotals = new LinkedHashMap<>();
        for (UserId person : people) {
            subtotals.put(person, Money.ZERO);
        }
        for (ReceiptItem item : items) {
            for (UserId sharer : item.sharers()) {
                if (!subtotals.containsKey(sharer)) {
                    throw new IllegalArgumentException("Everyone sharing " + item.name() + " must be in the split");
                }
            }
            List<UserId> ordered = people.stream().filter(item.sharers()::contains).toList();
            EqualSplit.divide(item.price(), ordered, payer)
                    .forEach((person, part) -> subtotals.merge(person, part, Money::plus));
        }
        return subtotals;
    }

    @Override
    public Map<UserId, Money> split(Money total, List<UserId> people, UserId payer) {
        SplitStrategy.checkInputs(total, people);
        Map<UserId, Money> subtotals = itemSubtotals(people, payer);
        long itemsSum = items.stream().mapToLong(i -> i.price().centavos()).sum();
        if (itemsSum + extras.centavos() != total.centavos()) {
            throw new IllegalArgumentException("Items and extras must add up to the total");
        }

        Map<UserId, Money> shares = new LinkedHashMap<>();
        Map<UserId, Long> fractions = new LinkedHashMap<>();
        long handedOut = 0;
        for (UserId person : people) {
            long numerator = extras.centavos() * subtotals.get(person).centavos();
            long base = numerator / itemsSum; // truncates toward zero
            fractions.put(person, Math.abs(numerator % itemsSum));
            shares.put(person, subtotals.get(person).plus(Money.ofCentavos(base)));
            handedOut += base;
        }

        long remaining = extras.centavos() - handedOut;
        List<UserId> byLargestFraction = new ArrayList<>(people);
        byLargestFraction.sort(Comparator.comparing((UserId p) -> fractions.get(p)).reversed()); // stable: ties keep people order
        for (int i = 0; remaining != 0; i++) {
            UserId person = byLargestFraction.get(i % byLargestFraction.size());
            shares.put(person, shares.get(person).plus(Money.ofCentavos(Long.signum(remaining))));
            remaining -= Long.signum(remaining);
        }
        return shares;
    }

    @Override
    public SplitType type() {
        return SplitType.ITEMIZED;
    }
}
