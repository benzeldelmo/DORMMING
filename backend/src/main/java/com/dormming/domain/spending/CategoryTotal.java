package com.dormming.domain.spending;

import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Category;

public record CategoryTotal(Category category, Money total) {
}
