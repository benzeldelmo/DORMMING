package com.dormming.domain.ledger;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.money.Money;
import com.dormming.domain.split.EqualSplit;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.Payment;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

class LedgerTest {

    static final UserId A = new UserId("a");
    static final UserId B = new UserId("b");
    static final UserId C = new UserId("c");
    static final LocalDate TODAY = LocalDate.of(2026, 11, 11);
    static final Instant NOW = Instant.parse("2026-11-11T08:00:00Z");

    static Money c(long centavos) {
        return Money.ofCentavos(centavos);
    }

    static SharedExpense shared(UserId payer, long amount, List<UserId> people) {
        return SharedExpense.create(null, "d1", payer, c(amount), TODAY, "", Category.OTHERS, payer, people,
                new EqualSplit(), NOW);
    }

    static Ledger ledger() {
        var e1 = shared(A, 30000, List.of(A, B, C)); // B, C owe A 10000
        var e2 = shared(B, 6000, List.of(A, B));     // A owes B 3000
        var e3 = shared(C, 4000, List.of(A, B));     // payer not a participant: A, B owe C 2000 each
        var pay = new Payment(null, "d1", B, A, c(2000), TODAY, "", NOW);
        return new Ledger(List.of(e1, e2, e3), List.of(pay));
    }

    @Test
    void netsDebtsWithinEachPair() {
        Ledger ledger = ledger();
        assertThat(ledger.openDebt(B, A)).isEqualTo(c(5000));
        assertThat(ledger.openDebt(A, B)).isEqualTo(Money.ZERO);
        assertThat(ledger.openDebt(A, C)).isEqualTo(Money.ZERO);
        assertThat(ledger.openDebt(C, A)).isEqualTo(c(8000));
        assertThat(ledger.totalOwedTo(A)).isEqualTo(c(13000));
    }

    @Test
    void payerWhoIsNotAParticipantIsOwedTheFullShares() {
        var ledger = new Ledger(List.of(shared(C, 4000, List.of(A, B))), List.of());
        assertThat(ledger.openDebt(A, C)).isEqualTo(c(2000));
        assertThat(ledger.openDebt(B, C)).isEqualTo(c(2000));
        assertThat(ledger.totalOwedTo(C)).isEqualTo(c(4000));
    }

    @Test
    void totalsBalanceAcrossMembers() {
        Ledger ledger = ledger();
        long owedTo = Stream.of(A, B, C).mapToLong(u -> ledger.totalOwedTo(u).centavos()).sum();
        long owedBy = Stream.of(A, B, C).mapToLong(u -> ledger.totalOwedBy(u).centavos()).sum();
        assertThat(owedTo).isEqualTo(owedBy);
    }

    @Test
    void listsDebtsAndSettledState() {
        Ledger ledger = ledger();
        assertThat(ledger.debtsInvolving(A)).containsExactlyInAnyOrder(
                new Debt(B, A, c(5000)), new Debt(C, A, c(8000)));
        assertThat(ledger.isSettled(B)).isFalse();
        assertThat(new Ledger(List.of(), List.of()).isSettled(A)).isTrue();
    }
}
