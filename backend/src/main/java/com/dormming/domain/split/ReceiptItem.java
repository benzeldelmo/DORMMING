package com.dormming.domain.split;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;
import java.util.List;

/** One line on a thermal receipt and who shares it. */
public record ReceiptItem(String name, Money price, List<UserId> sharers) {
    public ReceiptItem {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Every item needs a name");
        }
        if (price == null || !price.isPositive()) {
            throw new IllegalArgumentException("Every item needs a price above ₱0.00");
        }
        if (sharers == null || sharers.isEmpty()) {
            throw new IllegalArgumentException("Pick who shares " + name);
        }
        sharers = List.copyOf(sharers);
    }
}
