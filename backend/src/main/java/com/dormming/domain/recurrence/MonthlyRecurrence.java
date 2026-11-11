package com.dormming.domain.recurrence;

import java.time.LocalDate;
import java.util.Optional;

/** Repeats on the same day each month; short months use their last day, then snap back. */
public class MonthlyRecurrence implements Recurrence {

    private final int anchorDay;

    public MonthlyRecurrence(int anchorDay) {
        if (anchorDay < 1 || anchorDay > 31) {
            throw new IllegalArgumentException("Day of month must be 1 to 31");
        }
        this.anchorDay = anchorDay;
    }

    @Override
    public Optional<LocalDate> next(LocalDate from) {
        LocalDate nextMonth = from.plusMonths(1);
        return Optional.of(nextMonth.withDayOfMonth(Math.min(anchorDay, nextMonth.lengthOfMonth())));
    }

    @Override
    public String code() {
        return "MONTHLY";
    }
}
