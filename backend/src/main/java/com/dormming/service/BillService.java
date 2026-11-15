package com.dormming.service;

import com.dormming.model.Bill;
import com.dormming.model.Money;
import com.dormming.model.UserId;
import com.dormming.repository.BillRepository;
import com.dormming.service.exception.NotFoundException;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/** Personal payment reminders: add one, see yours soonest first, mark it paid, delete it. */
@Service
public class BillService {

    private final BillRepository bills;
    private final Clock clock;

    public BillService(BillRepository bills, Clock clock) {
        this.bills = bills;
        this.clock = clock;
    }

    public Bill add(UserId owner, String name, Money amount, LocalDate dueDate, boolean monthly) {
        return bills.save(new Bill(null, owner, name, amount, dueDate, monthly));
    }

    public List<Bill> list(UserId owner) {
        return bills.findByOwner(owner).stream().sorted(Comparator.comparing(Bill::dueDate)).toList();
    }

    /** A monthly bill moves to its next due date after today; a one-time bill is done and goes away. Returns the next one, or null. */
    public Bill pay(UserId owner, String id) {
        Bill bill = own(owner, id);
        if (bill.monthly()) {
            return bills.save(bill.nextAfter(LocalDate.now(clock)));
        }
        bills.delete(id);
        return null;
    }

    public void delete(UserId owner, String id) {
        bills.delete(own(owner, id).id());
    }

    // Someone else's bill is "not found", so its existence never leaks.
    private Bill own(UserId owner, String id) {
        return bills.findById(id).filter(b -> b.owner().equals(owner))
                .orElseThrow(() -> new NotFoundException("Bill not found"));
    }
}
