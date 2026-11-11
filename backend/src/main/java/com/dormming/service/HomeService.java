package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.ledger.Ledger;
import com.dormming.domain.ming.MingMood;
import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import com.dormming.repo.UserRepository;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

/** Everything the Home screen shows, in one call. */
@Service
public class HomeService {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH);

    private final DormService dorms;
    private final BalanceService balances;
    private final BillService bills;
    private final ActivityService activity;
    private final TransactionRepository transactions;
    private final UserRepository users;
    private final Clock clock;

    public HomeService(DormService dorms, BalanceService balances, BillService bills, ActivityService activity,
            TransactionRepository transactions, UserRepository users, Clock clock) {
        this.dorms = dorms;
        this.balances = balances;
        this.bills = bills;
        this.activity = activity;
        this.transactions = transactions;
        this.users = users;
        this.clock = clock;
    }

    public HomeData home(UserId userId) {
        User me = users.findById(userId).orElseThrow(() -> new UnauthorizedException("Please log in again"));
        LocalDate today = LocalDate.now(clock);
        Instant now = clock.instant();
        Dorm dorm = dorms.current(userId).orElse(null);
        Ledger ledger = dorm == null ? new Ledger(List.of(), List.of()) : balances.ledgerFor(dorm.id());
        List<Bill> upcoming = dorm == null ? List.of() : bills.list(userId, "upcoming", today);
        List<Transaction> recent = activity.recent(userId, 5);

        Money iOwe = ledger.totalOwedBy(userId);
        boolean billDueSoon = upcoming.stream().anyMatch(b -> b.isDueWithin(userId, today, 2));
        boolean paidRecently = dorm != null && transactions.paymentsByDorm(dorm.id()).stream()
                .anyMatch(p -> p.from().equals(userId) && p.createdAt().isAfter(now.minus(Duration.ofHours(24))));
        boolean active = recent.stream().anyMatch(t -> t.createdAt().isAfter(now.minus(Duration.ofDays(7))));
        MingMood mood = MingMood.of(iOwe, billDueSoon, paidRecently && iOwe.isZero(), active);

        Bill banner = upcoming.stream().filter(b -> b.isDueWithin(userId, today, b.remindDaysBefore())).findFirst()
                .orElse(null);
        return new HomeData(me, dorm, mood, mood.line(me.mingName()), banner, banner == null ? null : bannerText(banner, today),
                ledger.totalOwedTo(userId), iOwe, upcoming.stream().limit(3).toList(), recent);
    }

    static String bannerText(Bill bill, LocalDate today) {
        if (today.isAfter(bill.dueDate())) {
            return "Your " + bill.name() + " is overdue!";
        }
        if (today.equals(bill.dueDate())) {
            return "Your " + bill.name() + " is due today!";
        }
        if (today.plusDays(1).equals(bill.dueDate())) {
            return "Your " + bill.name() + " is due tomorrow!";
        }
        return "Your " + bill.name() + " is due on " + DAY.format(bill.dueDate()) + "!";
    }
}
