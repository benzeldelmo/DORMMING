package com.dormming.domain.ledger;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;

/** {@code from} owes {@code to} this amount. */
public record Debt(UserId from, UserId to, Money amount) {
}
