package com.dormming.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;

class MoneyTest {

    @Test
    void parsesPesoTextIntoCentavos() {
        assertThat(Money.ofPesos("1,000.50").centavos()).isEqualTo(100050);
        assertThat(Money.ofPesos("₱1000").centavos()).isEqualTo(100000);
        assertThat(Money.ofPesos(" 12.5 ").centavos()).isEqualTo(1250);
    }

    @Test
    void rejectsBadPesoText() {
        for (String bad : List.of("", "abc", "1.234", "-5", "0", "0.00")) {
            assertThatThrownBy(() -> Money.ofPesos(bad))
                    .as(bad)
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test
    void formatsAsPesos() {
        assertThat(Money.ofCentavos(100000).format()).isEqualTo("₱1,000.00");
        assertThat(Money.ofCentavos(-500).format()).isEqualTo("-₱5.00");
    }

    @Test
    void subtractsIntoNegative() {
        assertThat(Money.ofCentavos(300).minus(Money.ofCentavos(500)).centavos()).isEqualTo(-200);
    }
}
