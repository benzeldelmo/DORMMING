package com.dormming.service;

import com.dormming.domain.money.Money;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.UserId;
import java.time.LocalDate;
import java.util.Map;

public record BillInput(String name, Category category, Money amount, LocalDate dueDate, String recurrence,
        int remindDaysBefore, SplitType split, Map<UserId, Money> amounts) {
}
