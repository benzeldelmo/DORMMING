package com.dormming.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * The only place balances are worked out. Debts are netted within each pair of people:
 * if A owes B ₱300 and B owes A ₱100, A owes B ₱200. Nothing is routed through a third person.
 */
public class Ledger {

    private record Pair(UserId from, UserId to) {
    }

    private final Map<Pair, Long> gross = new HashMap<>();
    private final Set<UserId> people = new HashSet<>();

    public Ledger(List<SharedExpense> expenses, List<Payment> payments) {
        for (SharedExpense expense : expenses) {
            expense.debtsToPayer().forEach((debtor, share) -> add(debtor, expense.payer(), share.centavos()));
        }
        // A payment from X to Y cancels what X owed Y, so it counts as Y "owing" X.
        for (Payment payment : payments) {
            add(payment.to(), payment.from(), payment.amount().centavos());
        }
    }

    private void add(UserId from, UserId to, long centavos) {
        gross.merge(new Pair(from, to), centavos, Long::sum);
        people.add(from);
        people.add(to);
    }

    /** What {@code from} still owes {@code to} after netting; never negative. */
    public Money openDebt(UserId from, UserId to) {
        long net = gross.getOrDefault(new Pair(from, to), 0L) - gross.getOrDefault(new Pair(to, from), 0L);
        return Money.ofCentavos(Math.max(net, 0));
    }

    public List<Debt> debtsInvolving(UserId user) {
        List<Debt> debts = new ArrayList<>();
        for (UserId other : people) {
            if (other.equals(user)) {
                continue;
            }
            Money iOwe = openDebt(user, other);
            Money theyOwe = openDebt(other, user);
            if (iOwe.isPositive()) {
                debts.add(new Debt(user, other, iOwe));
            }
            if (theyOwe.isPositive()) {
                debts.add(new Debt(other, user, theyOwe));
            }
        }
        return debts;
    }

    public List<Debt> allDebts() {
        List<Debt> debts = new ArrayList<>();
        for (UserId from : people) {
            for (UserId to : people) {
                Money amount = from.equals(to) ? Money.ZERO : openDebt(from, to);
                if (amount.isPositive()) {
                    debts.add(new Debt(from, to, amount));
                }
            }
        }
        return debts;
    }

    public Money totalOwedTo(UserId user) {
        return debtsInvolving(user).stream().filter(d -> d.to().equals(user))
                .map(Debt::amount).reduce(Money.ZERO, Money::plus);
    }

    public Money totalOwedBy(UserId user) {
        return debtsInvolving(user).stream().filter(d -> d.from().equals(user))
                .map(Debt::amount).reduce(Money.ZERO, Money::plus);
    }

    /** Nothing owed either way. */
    public boolean isSettled(UserId user) {
        return debtsInvolving(user).isEmpty();
    }
}
