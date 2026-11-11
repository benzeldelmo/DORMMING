package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.dorm.Dorm;
import java.util.List;
import org.junit.jupiter.api.Test;

class PaymentServiceTest {

    World w = new World();

    @Test
    void rejectsOverpayingSelfAndOutsidersWithoutChangingBalances() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b)); // b owes a 10000
        var outsider = w.user("z", "Zed");
        assertThatThrownBy(() -> w.payments.record(w.b, w.a, c(15000), "", w.today))
                .hasMessage("That's more than you owe (₱100.00)");
        assertThatThrownBy(() -> w.payments.record(w.b, w.b, c(100), "", w.today)).hasMessage("You can't pay yourself");
        assertThatThrownBy(() -> w.payments.record(w.b, outsider, c(100), "", w.today))
                .hasMessage("That person isn't in your dorm");
        assertThat(w.balances.ledgerFor(dorm.id()).openDebt(w.b, w.a)).isEqualTo(c(10000));
    }

    @Test
    void partialPaymentLeavesTheRestOpen() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b));
        w.payments.record(w.b, w.a, c(4000), "", w.today);
        assertThat(w.balances.ledgerFor(dorm.id()).openDebt(w.b, w.a)).isEqualTo(c(6000));
    }
}
