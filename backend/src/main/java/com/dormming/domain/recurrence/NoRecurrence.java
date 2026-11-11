package com.dormming.domain.recurrence;

import java.time.LocalDate;
import java.util.Optional;

public class NoRecurrence implements Recurrence {
    @Override
    public Optional<LocalDate> next(LocalDate from) {
        return Optional.empty();
    }

    @Override
    public String code() {
        return "NONE";
    }
}
