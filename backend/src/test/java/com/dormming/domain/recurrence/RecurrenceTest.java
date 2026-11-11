package com.dormming.domain.recurrence;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class RecurrenceTest {

    @Test
    void monthlyKeepsAnchorDayAcrossShortMonths() {
        assertThat(new MonthlyRecurrence(31).next(LocalDate.of(2026, 1, 31))).contains(LocalDate.of(2026, 2, 28));
        assertThat(new MonthlyRecurrence(31).next(LocalDate.of(2026, 2, 28))).contains(LocalDate.of(2026, 3, 31));
    }

    @Test
    void weeklyAddsSevenDays() {
        assertThat(new WeeklyRecurrence().next(LocalDate.of(2026, 11, 13))).contains(LocalDate.of(2026, 11, 20));
    }

    @Test
    void noneHasNoNext() {
        assertThat(new NoRecurrence().next(LocalDate.of(2026, 11, 13))).isEmpty();
    }

    @Test
    void fromCodeBuildsTheRightKind() {
        LocalDate anchor = LocalDate.of(2026, 11, 12);
        assertThat(Recurrence.fromCode("MONTHLY", anchor).next(anchor)).contains(LocalDate.of(2026, 12, 12));
        assertThat(Recurrence.fromCode("WEEKLY", anchor).code()).isEqualTo("WEEKLY");
        assertThat(Recurrence.fromCode("NONE", anchor).code()).isEqualTo("NONE");
    }
}
