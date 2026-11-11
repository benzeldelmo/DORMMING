package com.dormming.domain.split;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * Polymorphism: an expense or bill asks "how much does each person pay?" without
 * knowing whether the answer is equal, typed in, or itemized from a receipt.
 */
public interface SplitStrategy {

    /**
     * @param people who shares the cost, in dorm join order
     * @param payer  who paid (may be null, e.g. for bills); never gets leftover centavos
     * @return each person's share, in {@code people} order, adding up exactly to {@code total}
     */
    Map<UserId, Money> split(Money total, List<UserId> people, UserId payer);

    SplitType type();

    static void checkInputs(Money total, List<UserId> people) {
        if (total == null || !total.isPositive()) {
            throw new IllegalArgumentException("Amount must be more than ₱0.00");
        }
        if (people == null || people.isEmpty()) {
            throw new IllegalArgumentException("Pick at least one person to split with");
        }
        if (new HashSet<>(people).size() != people.size()) {
            throw new IllegalArgumentException("Each person can only be in the split once");
        }
    }
}
