package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.model.Bill;
import com.dormming.service.exception.NotFoundException;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class BillServiceTest {

    World w = new World();

    @Test
    void listsOnlyYourOwnBillsSoonestFirst() {
        w.bills.add(w.a, "Water", c(30000), LocalDate.of(2026, 11, 20), false);
        w.bills.add(w.a, "Internet", c(150000), LocalDate.of(2026, 11, 12), true);
        w.bills.add(w.b, "Phone load", c(10000), LocalDate.of(2026, 11, 13), false);
        assertThat(w.bills.list(w.a)).extracting(Bill::name).containsExactly("Internet", "Water");
    }

    @Test
    void payingAMonthlyBillMovesItToNextMonth() {
        Bill internet = w.bills.add(w.a, "Internet", c(150000), LocalDate.of(2026, 11, 12), true);
        Bill next = w.bills.pay(w.a, internet.id());
        assertThat(next.dueDate()).isEqualTo(LocalDate.of(2026, 12, 12));
        assertThat(w.bills.list(w.a)).hasSize(1);
    }

    @Test
    void aMonthEndBillKeepsItsDayAfterAShortMonth() {
        Bill rent = w.bills.add(w.a, "Rent", c(500000), LocalDate.of(2026, 12, 31), true);
        Bill jan = w.bills.pay(w.a, rent.id());
        Bill feb = w.bills.pay(w.a, jan.id());
        Bill mar = w.bills.pay(w.a, feb.id());
        assertThat(jan.dueDate()).isEqualTo(LocalDate.of(2027, 1, 31));
        assertThat(feb.dueDate()).isEqualTo(LocalDate.of(2027, 2, 28)); // a short month uses its last day
        assertThat(mar.dueDate()).isEqualTo(LocalDate.of(2027, 3, 31)); // and the 31st comes back
    }

    @Test
    void payingAnOverdueMonthlyBillMovesItPastToday() {
        // today is 11 Nov: paid two months late, the next one is 10 Dec, not 10 Oct
        Bill internet = w.bills.add(w.a, "Internet", c(150000), LocalDate.of(2026, 9, 10), true);
        assertThat(w.bills.pay(w.a, internet.id()).dueDate()).isEqualTo(LocalDate.of(2026, 12, 10));
    }

    @Test
    void payingAOneTimeBillRemovesIt() {
        Bill water = w.bills.add(w.a, "Water", c(30000), LocalDate.of(2026, 11, 20), false);
        w.bills.pay(w.a, water.id());
        assertThat(w.bills.list(w.a)).isEmpty();
    }

    @Test
    void someoneElsesBillIsNotFound() {
        Bill water = w.bills.add(w.a, "Water", c(30000), LocalDate.of(2026, 11, 20), false);
        assertThatThrownBy(() -> w.bills.pay(w.b, water.id())).isInstanceOf(NotFoundException.class);
        assertThatThrownBy(() -> w.bills.delete(w.b, water.id())).isInstanceOf(NotFoundException.class);
    }

    @Test
    void rejectsABillWithNoNameOrNoAmount() {
        assertThatThrownBy(() -> w.bills.add(w.a, " ", c(100), w.today, false)).hasMessage("Give the bill a name");
        assertThatThrownBy(() -> w.bills.add(w.a, "Water", c(0), w.today, false)).hasMessage("Amount must be more than ₱0.00");
    }
}
