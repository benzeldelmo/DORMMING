package com.dormming.domain.transaction;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.money.Money;
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

    @Test
    void describesEachKind() {
        SharedExpense grocery = SharedExpense.create(null, "d1", B, c(270000), TODAY, "Grocery", Category.FOOD_GROCERIES,
                B, List.of(A, B, C), new EqualSplit(), NOW);
        assertThat(grocery.describe(NAMES)).isEqualTo("Vince paid ₱2,700.00 for Grocery, shared with Benzel and Sydney");
        assertThat(new Payment(null, "d1", A, B, c(50000), TODAY, "", NOW).describe(NAMES))
                .isEqualTo("Benzel paid Vince ₱500.00");
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
}
