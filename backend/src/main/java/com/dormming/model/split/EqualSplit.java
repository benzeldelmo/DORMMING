package com.dormming.model.split;

import com.dormming.model.Money;
import com.dormming.model.UserId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Everyone pays the same. Leftover centavos go to people other than the payer, in order. */
public class EqualSplit implements SplitStrategy {

    @Override
    public Map<UserId, Money> split(Money total, List<UserId> people, UserId payer) {
        SplitStrategy.checkInputs(total, people);
        return divide(total, people, payer);
    }

    /** Shared with ItemizedSplit, which splits each item with the same rule. */
    static Map<UserId, Money> divide(Money total, List<UserId> people, UserId payer) {
        long base = total.centavos() / people.size();
        long leftover = total.centavos() % people.size();
        Map<UserId, Money> shares = new LinkedHashMap<>();
        for (UserId person : people) {
            shares.put(person, Money.ofCentavos(base));
        }
        boolean payerInSplit = payer != null && people.contains(payer);
        for (UserId person : people) {
            if (leftover == 0) {
                break;
            }
            if (payerInSplit && person.equals(payer)) {
                continue;
            }
            shares.put(person, shares.get(person).plus(Money.ofCentavos(1)));
            leftover--;
        }
        return shares;
    }

    @Override
    public SplitType type() {
        return SplitType.EQUAL;
    }
}
