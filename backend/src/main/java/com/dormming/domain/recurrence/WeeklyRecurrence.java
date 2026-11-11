package com.dormming.domain.recurrence;

import java.time.LocalDate;
import java.util.Optional;

public class WeeklyRecurrence implements Recurrence {
    @Override
    public Optional<LocalDate> next(LocalDate from) {
        return Optional.of(from.plusWeeks(1));
    }

    @Override
    public String code() {
        return "WEEKLY";
    }
}
