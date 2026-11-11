package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Category;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;

class BillServiceTest {

    World w = new World();

    Bill internet() {
        return w.bills.create(w.a, new BillInput("Internet", Category.INTERNET_LOAD, c(150000),
                LocalDate.of(2026, 11, 12), "MONTHLY", 1, SplitType.EQUAL, Map.of()));
    }

    @Test
    void splitsAmongAllMembers() {
        w.dormOfThree();
        assertThat(internet().shares()).extracting(s -> s.amount().centavos()).containsExactly(50000L, 50000L, 50000L);
    }

    @Test
    void fullyPaidMonthlyBillRollsToNextMonth() {
        w.dormOfThree();
        Bill bill = internet();
        w.bills.pay(w.a, bill.id());
        w.bills.pay(w.b, bill.id());
        w.bills.pay(w.c, bill.id());
        var upcoming = w.bills.list(w.a, "upcoming", LocalDate.of(2026, 11, 12));
        assertThat(upcoming).extracting(Bill::dueDate).containsExactly(LocalDate.of(2026, 12, 12));
        assertThat(w.bills.list(w.a, "paid", LocalDate.of(2026, 11, 12))).extracting(Bill::id).containsExactly(bill.id());
    }

    @Test
    void overdueBillRollsOverExactlyOnce() {
        w.dormOfThree();
        internet();
        LocalDate later = LocalDate.of(2026, 11, 13);
        w.bills.list(w.a, "upcoming", later);
        var upcoming = w.bills.list(w.a, "upcoming", later);
        assertThat(upcoming).extracting(Bill::dueDate)
                .containsExactly(LocalDate.of(2026, 11, 12), LocalDate.of(2026, 12, 12));
    }
}
