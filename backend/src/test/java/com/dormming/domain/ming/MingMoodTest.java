package com.dormming.domain.ming;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.money.Money;
import org.junit.jupiter.api.Test;

class MingMoodTest {

    @Test
    void picksMoodByPriority() {
        assertThat(MingMood.of(Money.ofCentavos(100), false, true, true)).isEqualTo(MingMood.WORRIED);
        assertThat(MingMood.of(Money.ZERO, true, false, true)).isEqualTo(MingMood.WORRIED);
        assertThat(MingMood.of(Money.ZERO, false, true, true)).isEqualTo(MingMood.CELEBRATING);
        assertThat(MingMood.of(Money.ZERO, false, false, false)).isEqualTo(MingMood.SLEEPY);
        assertThat(MingMood.of(Money.ZERO, false, false, true)).isEqualTo(MingMood.HAPPY);
    }

    @Test
    void linesUseTheMingName() {
        assertThat(MingMood.HAPPY.line("Mingky")).isEqualTo("Mingky is happy. You're all square!");
        assertThat(MingMood.WORRIED.line("Ming")).isEqualTo("Ming is a little worried. Something needs paying.");
    }
}
