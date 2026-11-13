package com.dormming.controller.dto;

import com.dormming.model.Category;
import com.dormming.model.Money;
import com.dormming.model.UserId;
import com.dormming.model.split.ReceiptItem;
import com.dormming.model.split.SplitType;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Everything needed to record a shared expense, whichever way it's split. */
public record SharedExpenseInput(Money amount, Category category, String note, LocalDate date, UserId payer,
        List<UserId> participants, SplitType type, Map<UserId, Money> amounts, List<ReceiptItem> items, Money extras) {
}
