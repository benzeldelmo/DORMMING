package com.dormming.domain.transaction;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.util.function.Function;

/** Money one person spent on themselves. Not part of any dorm. */
public class PersonalExpense extends Transaction {

    private final Category category;

    public PersonalExpense(String id, UserId createdBy, Money amount, LocalDate date, String note, Category category,
            Instant createdAt) {
        super(id, null, amount, date, createdBy, note, createdAt);
        if (category == null) {
            throw new IllegalArgumentException("Pick a category");
        }
        this.category = category;
    }

    public Category category() {
        return category;
    }

    @Override
    public TransactionType type() {
        return TransactionType.PERSONAL_EXPENSE;
    }

    @Override
    public String describe(Function<UserId, String> nameOf) {
        String what = note().isEmpty() ? category.label() : note();
        return nameOf.apply(createdBy()) + " spent " + amount().format() + " on " + what;
    }
}
