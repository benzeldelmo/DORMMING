package com.dormming.domain.transaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.money.Money;
import com.dormming.domain.recurrence.MonthlyRecurrence;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.Test;

class TransactionTest {

    static final UserId A = new UserId("a");
    static final UserId B = new UserId("b");
    static final UserId C = new UserId("c");
    static final Function<UserId, String> NAMES = Map.of(A, "Benzel", B, "Vince", C, "Sydney")::get;
    static final Instant NOW = Instant.parse("2026-11-11T08:00:00Z");
    static final LocalDate TODAY = LocalDate.of(2026, 11, 11);

    static Money c(long centavos) {
        return Money.ofCentavos(centavos);
    }

    static Bill internetBill() {
        return Bill.create(null, "d1", A, "Internet", Category.INTERNET_LOAD, c(150000), LocalDate.of(2026, 11, 12),
                new MonthlyRecurrence(12), 1, List.of(A, B, C), new EqualSplit(), NOW);
    }

    @Test
    void describesEachKind() {
        SharedExpense grocery = SharedExpense.create(null, "d1", B, c(270000), TODAY, "Grocery", Category.FOOD_GROCERIES,
                B, List.of(A, B, C), new EqualSplit(), NOW);
        assertThat(grocery.describe(NAMES)).isEqualTo("Vince paid ₱2,700.00 for Grocery, shared with Benzel and Sydney");
        assertThat(new Payment(null, "d1", A, B, c(50000), TODAY, "", NOW).describe(NAMES))
                .isEqualTo("Benzel paid Vince ₱500.00");
        assertThat(internetBill().describe(NAMES)).isEqualTo("Internet bill ₱1,500.00 due Nov 12");
    }

    @Test
    void sharedExpenseDebtsExcludePayer() {
        SharedExpense grocery = SharedExpense.create(null, "d1", B, c(270000), TODAY, "Grocery", Category.FOOD_GROCERIES,
                B, List.of(A, B, C), new EqualSplit(), NOW);
        assertThat(grocery.debtsToPayer()).containsOnlyKeys(A, C);
        assertThat(grocery.shares()).hasSize(3);
    }

    @Test
    void rejectsPayingYourselfAndNonPositiveAmounts() {
        assertThatThrownBy(() -> new Payment(null, "d1", A, A, c(100), TODAY, "", NOW))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new Payment(null, "d1", A, B, c(0), TODAY, "", NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void billSharesPaymentStateAndRollover() {
        Bill bill = internetBill();
        assertThat(bill.shares()).extracting(s -> s.amount().centavos()).containsExactly(50000L, 50000L, 50000L);
        bill.markPaid(A, NOW);
        assertThat(bill.isFullyPaid()).isFalse();
        assertThat(bill.isOverdueFor(B, LocalDate.of(2026, 11, 13))).isTrue();
        assertThat(bill.isOverdueFor(A, LocalDate.of(2026, 11, 13))).isFalse();
        assertThat(bill.isDueWithin(B, LocalDate.of(2026, 11, 10), 2)).isTrue();
        assertThat(bill.isDueWithin(B, LocalDate.of(2026, 11, 9), 2)).isFalse();
        Bill next = bill.nextInstance(NOW).orElseThrow();
        assertThat(next.dueDate()).isEqualTo(LocalDate.of(2026, 12, 12));
        assertThat(next.shares()).noneMatch(BillShare::isPaid);
        assertThat(next.id()).isNotEqualTo(bill.id());
    }

    @Test
    void markPaidRejectsNonMember() {
        assertThatThrownBy(() -> internetBill().markPaid(new UserId("z"), NOW))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
