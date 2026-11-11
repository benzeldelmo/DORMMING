package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Payment;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final TransactionRepository transactions;
    private final DormService dorms;
    private final BalanceService balances;
    private final Clock clock;

    public PaymentService(TransactionRepository transactions, DormService dorms, BalanceService balances, Clock clock) {
        this.transactions = transactions;
        this.dorms = dorms;
        this.balances = balances;
        this.clock = clock;
    }

    public Payment record(UserId from, UserId to, Money amount, String note, LocalDate date) {
        Dorm dorm = dorms.require(from);
        if (from.equals(to)) {
            throw new IllegalArgumentException("You can't pay yourself");
        }
        if (to == null || !dorm.hasMember(to)) {
            throw new IllegalArgumentException("That person isn't in your dorm");
        }
        Money open = balances.ledgerFor(dorm.id()).openDebt(from, to);
        if (amount.compareTo(open) > 0) {
            throw new IllegalArgumentException("That's more than you owe (" + open.format() + ")");
        }
        return (Payment) transactions.save(new Payment(null, dorm.id(), from, to, amount,
                date == null ? LocalDate.now(clock) : date, note, clock.instant()));
    }
}
