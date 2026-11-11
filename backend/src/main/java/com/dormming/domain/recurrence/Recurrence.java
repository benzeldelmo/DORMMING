package com.dormming.domain.recurrence;

import java.time.LocalDate;
import java.util.Optional;

/** Polymorphism: how a bill repeats. Each kind answers "when is the next one?" its own way. */
public interface Recurrence {

    Optional<LocalDate> next(LocalDate from);

    String code();

    static Recurrence fromCode(String code, LocalDate anchor) {
        return switch (code == null ? "NONE" : code) {
            case "NONE" -> new NoRecurrence();
            case "WEEKLY" -> new WeeklyRecurrence();
            case "MONTHLY" -> new MonthlyRecurrence(anchor.getDayOfMonth());
            default -> throw new IllegalArgumentException("Repeat must be NONE, WEEKLY or MONTHLY");
        };
    }
}
