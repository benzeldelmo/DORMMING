package com.dormming.service;

import com.dormming.model.Dorm;
import com.dormming.model.SharedExpense;
import com.dormming.model.Transaction;
import com.dormming.model.UserId;
import com.dormming.model.split.CustomSplit;
import com.dormming.model.split.EqualSplit;
import com.dormming.model.split.ItemizedSplit;
import com.dormming.model.split.SplitStrategy;
import com.dormming.repository.TransactionRepository;
import com.dormming.service.exception.NotAllowedException;
import com.dormming.service.exception.NotFoundException;
import java.time.Clock;
import java.time.LocalDate;
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

    public SharedExpense addShared(UserId actor, SharedExpenseInput in) {
        Dorm dorm = dorms.require(actor);
        return (SharedExpense) transactions.save(build(dorm, actor, in));
    }

    private SharedExpense build(Dorm dorm, UserId createdBy, SharedExpenseInput in) {
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
        return SharedExpense.create(null, dorm.id(), createdBy, in.amount(), orToday(in.date()), in.note(),
                in.category(), in.payer(), ordered, strategy, clock.instant());
    }

    public void delete(UserId actor, String id) {
        Dorm dorm = dorms.require(actor);
        if (!(find(id) instanceof SharedExpense expense) || !dorm.id().equals(expense.dormId())) {
            throw new NotFoundException("Expense not found");
        }
        if (!dorms.memberOf(dorm, actor).canEdit(expense)) {
            throw new NotAllowedException("Only the person who added this or the dorm creator can delete it");
        }
        // Deleting would leave a debt to (or from) someone who can no longer pay or be paid.
        boolean someoneLeft = !dorm.hasMember(expense.payer())
                || !expense.participants().stream().allMatch(dorm::hasMember);
        if (someoneLeft) {
            throw new NotAllowedException("Someone in this expense left the dorm, so it can't be deleted");
        }
        transactions.delete(id);
    }

    /** The dorm's expenses; q matches the note or category, ignoring case. Newest first. */
    public List<SharedExpense> list(UserId user, String q) {
        List<SharedExpense> result = dorms.current(user).map(d -> transactions.sharedByDorm(d.id())).orElse(List.of());
        String needle = q == null ? "" : q.strip().toLowerCase(Locale.ROOT);
        return result.stream()
                .filter(t -> needle.isEmpty() || t.note().toLowerCase(Locale.ROOT).contains(needle)
                        || t.category().label().toLowerCase(Locale.ROOT).contains(needle))
                .sorted(Comparator.comparing(SharedExpense::createdAt).reversed())
                .toList();
    }

    private Transaction find(String id) {
        return transactions.findById(id).orElseThrow(() -> new NotFoundException("Expense not found"));
    }
}
