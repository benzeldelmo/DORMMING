package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.money.Money;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.Payment;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.user.CardColor;
import com.dormming.domain.user.FriendCode;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.memory.InMemoryDormRepository;
import com.dormming.repo.memory.InMemoryFriendRepository;
import com.dormming.repo.memory.InMemoryInviteRepository;
import com.dormming.repo.memory.InMemoryTransactionRepository;
import com.dormming.repo.memory.InMemoryUserRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Random;

/** Services wired to in-memory storage with a fixed clock: Wed 11 Nov 2026, 4pm Manila. */
class World {

    final Clock clock = Clock.fixed(Instant.parse("2026-11-11T08:00:00Z"), ZoneId.of("Asia/Manila"));
    final LocalDate today = LocalDate.now(clock);
    final Random random = new Random(7);

    final InMemoryUserRepository users = new InMemoryUserRepository();
    final InMemoryDormRepository dorms = new InMemoryDormRepository();
    final InMemoryTransactionRepository transactions = new InMemoryTransactionRepository();
    final InMemoryFriendRepository friends = new InMemoryFriendRepository();
    final InMemoryInviteRepository invites = new InMemoryInviteRepository();

    final BalanceService balances = new BalanceService(transactions);
    final DormService dormService = new DormService(dorms, users, friends, invites, balances, random, clock);

    final UserId a = user("a", "Benzel");
    final UserId b = user("b", "Vince");
    final UserId c = user("c", "Sydney");

    UserId user(String id, String name) {
        UserId userId = new UserId(id);
        users.save(new User(userId, id + "@demo.ph", name, null, CardColor.OLIVE, FriendCode.generate(random)));
        return userId;
    }

    /** a creates the dorm; b then c join. */
    Dorm dormOfThree() {
        Dorm dorm = dormService.create(a, "Mabini 3B");
        dormService.join(b, dorm.code().value().toLowerCase());
        dormService.join(c, dorm.code().value());
        return dorms.findById(dorm.id()).orElseThrow();
    }

    static Money c(long centavos) {
        return Money.ofCentavos(centavos);
    }

    SharedExpense sharedEqual(Dorm dorm, UserId payer, long amount, List<UserId> people) {
        return (SharedExpense) transactions.save(SharedExpense.create(null, dorm.id(), payer, c(amount), today, "",
                Category.OTHERS, payer, people, new EqualSplit(), clock.instant()));
    }

    Payment payment(Dorm dorm, UserId from, UserId to, long amount) {
        return (Payment) transactions.save(new Payment(null, dorm.id(), from, to, c(amount), today, "", clock.instant()));
    }
}
