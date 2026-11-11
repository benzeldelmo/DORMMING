package com.dormming.service;

import com.dormming.domain.money.Money;
import com.dormming.domain.split.ReceiptItem;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.UserId;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Everything needed to record a shared expense, whichever way it's split. */
public record SharedExpenseInput(Money amount, Category category, String note, LocalDate date, UserId payer,
        List<UserId> participants, SplitType type, Map<UserId, Money> amounts, List<ReceiptItem> items, Money extras) {
}
