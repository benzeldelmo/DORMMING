package com.dormming.model.split;

import com.dormming.model.Money;
import com.dormming.model.UserId;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Each person's amount is typed in. The amounts must add up to the total. */
public class CustomSplit implements SplitStrategy {

    private final Map<UserId, Money> amounts;

    public CustomSplit(Map<UserId, Money> amounts) {
        this.amounts = Map.copyOf(amounts);
    }

    @Override
    public Map<UserId, Money> split(Money total, List<UserId> people, UserId payer) {
        SplitStrategy.checkInputs(total, people);
        if (!amounts.keySet().equals(new HashSet<>(people))) {
            throw new IllegalArgumentException("Enter an amount for each person in the split");
        }
        Map<UserId, Money> shares = new LinkedHashMap<>();
        Money sum = Money.ZERO;
        for (UserId person : people) {
            Money amount = amounts.get(person);
            if (amount.isNegative()) {
                throw new IllegalArgumentException("Amounts can't be negative");
            }
            shares.put(person, amount);
            sum = sum.plus(amount);
        }
        if (!sum.equals(total)) {
            throw new IllegalArgumentException(
                    "Amounts add up to " + sum.format() + " but the total is " + total.format());
        }
        return shares;
    }

    @Override
    public SplitType type() {
        return SplitType.CUSTOM;
    }
}
