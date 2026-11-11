package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.money.Money;
import com.dormming.domain.split.CustomSplit;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.split.ItemizedSplit;
import com.dormming.domain.split.SplitStrategy;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.PersonalExpense;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class ExpenseService {

    private final TransactionRepository transactions;
    private final DormService dorms;
    private final Clock clock;

    public ExpenseService(TransactionRepository transactions, DormService dorms, Clock clock) {
        this.transactions = transactions;
        this.dorms = dorms;
        this.clock = clock;
    }

    private LocalDate orToday(LocalDate date) {
        return date == null ? LocalDate.now(clock) : date;
    }

    public PersonalExpense addPersonal(UserId user, Money amount, Category category, String note, LocalDate date) {
        return (PersonalExpense) transactions.save(
                new PersonalExpense(null, user, amount, orToday(date), note, category, clock.instant()));
    }

    public PersonalExpense updatePersonal(UserId user, String id, Money amount, Category category, String note,
            LocalDate date) {
        Transaction existing = find(id);
        if (!(existing instanceof PersonalExpense) || !existing.createdBy().equals(user)) {
            throw new NotAllowedException("You can only edit your own expenses");
        }
        return (PersonalExpense) transactions.save(
                new PersonalExpense(id, user, amount, orToday(date), note, category, existing.createdAt()));
    }

    public SharedExpense addShared(UserId actor, SharedExpenseInput in) {
        Dorm dorm = dorms.require(actor);
        return (SharedExpense) transactions.save(build(dorm, null, actor, in, clock.instant()));
    }

    public SharedExpense updateShared(UserId actor, String id, SharedExpenseInput in) {
        Dorm dorm = dorms.require(actor);
        Transaction existing = find(id);
        if (!(existing instanceof SharedExpense) || !dorm.id().equals(existing.dormId())) {
            throw new NotFoundException("Expense not found");
        }
        if (!dorms.memberOf(dorm, actor).canEdit(existing)) {
            throw new NotAllowedException("Only the person who added this or the dorm creator can change it");
        }
        return (SharedExpense) transactions.save(build(dorm, id, existing.createdBy(), in, existing.createdAt()));
    }

    private SharedExpense build(Dorm dorm, String id, UserId createdBy, SharedExpenseInput in, Instant createdAt) {
        if (in.payer() == null || in.participants() == null || in.type() == null) {
            throw new IllegalArgumentException("Pick who paid, who shares it, and how to split");
        }
        if (!dorm.hasMember(in.payer()) || !in.participants().stream().allMatch(dorm::hasMember)) {
            throw new IllegalArgumentException("Everyone in the split must be in your dorm");
        }
        List<UserId> ordered = dorm.memberIdsInJoinOrder().stream().filter(in.participants()::contains).toList();
        if (ordered.size() != in.participants().size()) {
            throw new IllegalArgumentException("Each person can only be in the split once");
        }
        SplitStrategy strategy = switch (in.type()) {
            case EQUAL -> new EqualSplit();
            case CUSTOM -> new CustomSplit(in.amounts());
            case ITEMIZED -> new ItemizedSplit(in.items(), in.extras());
        };
        return SharedExpense.create(id, dorm.id(), createdBy, in.amount(), orToday(in.date()), in.note(),
                in.category(), in.payer(), ordered, strategy, createdAt);
    }

    public void delete(UserId actor, String id) {
        Transaction existing = find(id);
        if (existing instanceof PersonalExpense) {
            if (!existing.createdBy().equals(actor)) {
                throw new NotAllowedException("You can only delete your own expenses");
            }
        } else if (existing instanceof SharedExpense) {
            Dorm dorm = dorms.require(actor);
            if (!dorm.id().equals(existing.dormId())) {
                throw new NotFoundException("Expense not found");
            }
            if (!dorms.memberOf(dorm, actor).canEdit(existing)) {
                throw new NotAllowedException("Only the person who added this or the dorm creator can delete it");
            }
        } else {
            throw new NotFoundException("Expense not found");
        }
        transactions.delete(id);
    }

    /** scope: personal, shared or all. q matches the note or category, ignoring case. Newest first. */
    public List<Transaction> list(UserId user, String scope, String q) {
        String s = scope == null ? "all" : scope;
        List<Transaction> result = new ArrayList<>();
        if (!s.equals("shared")) {
            result.addAll(transactions.personalByUser(user));
        }
        if (!s.equals("personal")) {
            dorms.current(user).ifPresent(d -> result.addAll(transactions.sharedByDorm(d.id())));
        }
        String needle = q == null ? "" : q.strip().toLowerCase(Locale.ROOT);
        return result.stream()
                .filter(t -> needle.isEmpty() || t.note().toLowerCase(Locale.ROOT).contains(needle)
                        || categoryOf(t).label().toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(Transaction::createdAt).reversed())
                .toList();
    }

    public Transaction find(String id) {
        return transactions.findById(id).orElseThrow(() -> new NotFoundException("Expense not found"));
    }

    public static Category categoryOf(Transaction t) {
        return switch (t) {
            case PersonalExpense p -> p.category();
            case SharedExpense s -> s.category();
            default -> Category.OTHERS;
        };
    }
}
