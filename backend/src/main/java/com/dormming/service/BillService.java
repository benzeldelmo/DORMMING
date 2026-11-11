package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.recurrence.Recurrence;
import com.dormming.domain.split.CustomSplit;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.split.SplitStrategy;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BillService {

    private final TransactionRepository transactions;
    private final DormService dorms;
    private final Clock clock;

    public BillService(TransactionRepository transactions, DormService dorms, Clock clock) {
        this.transactions = transactions;
        this.dorms = dorms;
        this.clock = clock;
    }

    public Bill create(UserId actor, BillInput in) {
        Dorm dorm = dorms.require(actor);
        if (in.dueDate() == null) {
            throw new IllegalArgumentException("Pick a due date");
        }
        SplitStrategy strategy = in.split() == SplitType.CUSTOM ? new CustomSplit(in.amounts()) : new EqualSplit();
        if (in.split() == SplitType.ITEMIZED) {
            throw new IllegalArgumentException("Bills split equally or by custom amounts");
        }
        return (Bill) transactions.save(Bill.create(null, dorm.id(), actor, in.name(), in.category(), in.amount(),
                in.dueDate(), Recurrence.fromCode(in.recurrence(), in.dueDate()), in.remindDaysBefore(),
                dorm.memberIdsInJoinOrder(), strategy, clock.instant()));
    }

    private Bill billInDorm(UserId user, String billId) {
        Dorm dorm = dorms.require(user);
        Transaction t = transactions.findById(billId).orElse(null);
        if (!(t instanceof Bill bill) || !dorm.id().equals(bill.dormId())) {
            throw new NotFoundException("Bill not found");
        }
        return bill;
    }

    public Bill pay(UserId user, String billId) {
        Bill bill = billInDorm(user, billId);
        bill.markPaid(user, clock.instant());
        return (Bill) transactions.save(bill);
    }

    public void delete(UserId actor, String billId) {
        Bill bill = billInDorm(actor, billId);
        if (!dorms.memberOf(dorms.require(actor), actor).canEdit(bill)) {
            throw new NotAllowedException("Only the person who added this bill or the dorm creator can delete it");
        }
        transactions.delete(billId);
    }

    /** upcoming: your share unpaid, soonest first. paid: your share paid, newest first. */
    public List<Bill> list(UserId user, String status, LocalDate today) {
        Dorm dorm = dorms.require(user);
        rollover(dorm.id(), today);
        List<Bill> mine = transactions.billsByDorm(dorm.id()).stream().filter(b -> b.shareOf(user).isPresent()).toList();
        if ("paid".equals(status)) {
            return mine.stream().filter(b -> b.shareOf(user).orElseThrow().isPaid())
                    .sorted(Comparator.comparing(Bill::dueDate).reversed()).toList();
        }
        return mine.stream().filter(b -> !b.shareOf(user).orElseThrow().isPaid())
                .sorted(Comparator.comparing(Bill::dueDate)).toList();
    }

    /** Creates the next bill in each repeating series once the current one is fully paid or past due. */
    public void rollover(String dormId, LocalDate today) {
        for (Bill bill : transactions.billsByDorm(dormId)) {
            if (!bill.isRolledOver() && (bill.isFullyPaid() || today.isAfter(bill.dueDate()))) {
                bill.nextInstance(clock.instant()).ifPresent(next -> {
                    transactions.save(next);
                    bill.markRolledOver();
                    transactions.save(bill);
                });
            }
        }
    }
}
