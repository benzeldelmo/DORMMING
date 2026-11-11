package com.dormming.service;

import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/** Everything the user can see, newest first: their own expenses plus their dorm's records. */
@Service
public class ActivityService {

    private final TransactionRepository transactions;
    private final DormService dorms;

    public ActivityService(TransactionRepository transactions, DormService dorms) {
        this.transactions = transactions;
        this.dorms = dorms;
    }

    public List<Transaction> recent(UserId user, int limit) {
        List<Transaction> all = new ArrayList<>(transactions.personalByUser(user));
        dorms.current(user).ifPresent(d -> {
            all.addAll(transactions.sharedByDorm(d.id()));
            all.addAll(transactions.paymentsByDorm(d.id()));
            all.addAll(transactions.billsByDorm(d.id()));
        });
        return all.stream().sorted(Comparator.comparing(Transaction::createdAt).reversed())
                .limit(Math.max(1, Math.min(limit, 200))).toList();
    }
}
