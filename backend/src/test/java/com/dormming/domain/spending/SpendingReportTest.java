package com.dormming.domain.spending;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.dormming.domain.money.Money;
import com.dormming.domain.recurrence.NoRecurrence;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.junit.jupiter.api.Test;

class SpendingReportTest {

    static final UserId A = new UserId("a");
    static final Instant NOW = Instant.parse("2026-11-11T08:00:00Z");

    static SharedExpense spent(long centavos, Category category, LocalDate date) {
        return SharedExpense.create(null, "d1", A, Money.ofCentavos(centavos), date, "", category, A, List.of(A),
                new EqualSplit(), NOW);
    }

    static Bill bill(long centavos, Category category, LocalDate due) {
        return Bill.create(null, "d1", A, "Bill", category, Money.ofCentavos(centavos), due, new NoRecurrence(), 1,
                List.of(A), new EqualSplit(), NOW);
    }

    final List<SharedExpense> expenses = List.of(
            spent(270000, Category.FOOD_GROCERIES, LocalDate.of(2026, 11, 11)),
            spent(200000, Category.FOOD_GROCERIES, LocalDate.of(2026, 11, 10)),
            spent(50000, Category.OTHERS, LocalDate.of(2026, 10, 31)));
    final List<Bill> bills = List.of(
            bill(150000, Category.INTERNET_LOAD, LocalDate.of(2026, 11, 13)),
            bill(100000, Category.RENT_UTILITIES, LocalDate.of(2026, 11, 17)),
            bill(90000, Category.RENT_UTILITIES, LocalDate.of(2026, 12, 1)));

    @Test
    void totalsTheMonthByCategoryLargestFirst() {
        var r = SpendingReport.of(YearMonth.of(2026, 11), expenses, bills);
        assertThat(r.total()).isEqualTo(Money.ofCentavos(720000));
        assertThat(r.byCategory()).extracting(t -> t.category().name(), t -> t.total().centavos())
                .containsExactly(tuple("FOOD_GROCERIES", 470000L), tuple("INTERNET_LOAD", 150000L),
                        tuple("RENT_UTILITIES", 100000L));
    }

    @Test
    void emptyMonth() {
        var r = SpendingReport.of(YearMonth.of(2026, 1), expenses, bills);
        assertThat(r.total()).isEqualTo(Money.ZERO);
        assertThat(r.byCategory()).isEmpty();
    }
}
