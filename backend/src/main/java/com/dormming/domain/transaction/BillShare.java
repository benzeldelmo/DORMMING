package com.dormming.domain.transaction;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;
import java.time.Instant;

/** One member's part of a bill, paid straight to the provider. */
public class BillShare {

    private final UserId userId;
    private final Money amount;
    private Instant paidAt;

    public BillShare(UserId userId, Money amount, Instant paidAt) {
        this.userId = userId;
        this.amount = amount;
        this.paidAt = paidAt;
    }

    public UserId userId() {
        return userId;
    }

    public Money amount() {
        return amount;
    }

    public Instant paidAt() {
        return paidAt;
    }

    public boolean isPaid() {
        return paidAt != null;
    }

    void markPaid(Instant when) {
        this.paidAt = when;
    }
}
