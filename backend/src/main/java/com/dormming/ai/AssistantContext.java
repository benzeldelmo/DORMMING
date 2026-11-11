package com.dormming.ai;

import com.dormming.domain.ledger.Debt;
import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/** What Ming knows about the user when answering. */
public record AssistantContext(User me, Map<UserId, String> dormmates, Money owedToMe, Money iOwe, List<Debt> debts,
        List<Bill> upcomingBills, LocalDate today) {

    public String nameOf(UserId id) {
        return id.equals(me.id()) ? "you" : dormmates.getOrDefault(id, "someone");
    }

    /** Finds a dormmate by full or first name, ignoring case. */
    public Optional<UserId> findDormmate(String name) {
        String wanted = name.strip().toLowerCase(Locale.ROOT);
        return dormmates.entrySet().stream()
                .filter(e -> {
                    String full = e.getValue().toLowerCase(Locale.ROOT);
                    return full.equals(wanted) || full.split("\\s+")[0].equals(wanted);
                })
                .map(Map.Entry::getKey).findFirst();
    }
}
