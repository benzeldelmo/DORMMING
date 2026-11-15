package com.dormming.service;

import com.dormming.model.Category;
import com.dormming.model.Dorm;
import com.dormming.model.Money;
import com.dormming.model.Payment;
import com.dormming.model.SharedExpense;
import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.model.split.EqualSplit;
import com.dormming.repository.memory.InMemoryBillRepository;
import com.dormming.repository.memory.InMemoryDormRepository;
import com.dormming.repository.memory.InMemoryTransactionRepository;
import com.dormming.repository.memory.InMemoryUserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;

/** Services wired to in-memory storage with a fixed clock: Wed 11 Nov 2026, 4pm Manila. */
public class World {

    public final Clock clock = Clock.fixed(Instant.parse("2026-11-11T08:00:00Z"), ZoneId.of("Asia/Manila"));
    public final LocalDate today = LocalDate.now(clock);
    public final Random random = new Random(7);

    public final InMemoryUserRepository users = new InMemoryUserRepository();
    public final InMemoryDormRepository dorms = new InMemoryDormRepository();
    public final InMemoryTransactionRepository transactions = new InMemoryTransactionRepository();

    public final BalanceService balances = new BalanceService(transactions);
    public final DormService dormService = new DormService(dorms, balances, random, clock);

    public final ExpenseService expenses = new ExpenseService(transactions, dormService, clock);
    public final PaymentService payments = new PaymentService(transactions, dormService, balances, clock);
    public final InMemoryBillRepository billRepo = new InMemoryBillRepository();
    public final BillService bills = new BillService(billRepo, clock);
    public final AccountService accounts = new AccountService(users, dormService, billRepo);

    public final UserId a = user("a", "Benzel");
    public final UserId b = user("b", "Vince");
    public final UserId c = user("c", "Sydney");

    public UserId user(String id, String name) {
        UserId userId = new UserId(id);
        users.save(new User(userId, id + "@demo.ph", name));
        return userId;
    }

    /** a creates the dorm; b then c join. */
    public Dorm dormOfThree() {
        Dorm dorm = dormService.create(a, "Mabini 3B");
        dormService.join(b, dorm.code().value().toLowerCase());
        dormService.join(c, dorm.code().value());
        return dorms.findById(dorm.id()).orElseThrow();
    }

    public static Money c(long centavos) {
        return Money.ofCentavos(centavos);
    }

    public SharedExpense sharedEqual(Dorm dorm, UserId payer, long amount, List<UserId> people) {
        return (SharedExpense) transactions.save(SharedExpense.create(null, dorm.id(), payer, c(amount), today, "",
                Category.OTHERS, payer, people, new EqualSplit(), clock.instant()));
    }

    public Payment payment(Dorm dorm, UserId from, UserId to, long amount) {
        return (Payment) transactions.save(new Payment(null, dorm.id(), from, to, c(amount), today, "", clock.instant()));
    }
}
