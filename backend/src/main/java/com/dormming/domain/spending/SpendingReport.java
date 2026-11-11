package com.dormming.domain.spending;

import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.transaction.Transaction;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

/**
 * What a dorm spent in one month: shared expenses dated that month plus bills due that month.
 * Payments only move money between dormmates, so they don't count. Read-only once built.
 */
public final class SpendingReport {

    private final YearMonth month;
    private final Money total;
    private final List<CategoryTotal> byCategory;

    private SpendingReport(YearMonth month, Money total, List<CategoryTotal> byCategory) {
        this.month = month;
        this.total = total;
        this.byCategory = byCategory;
    }

    public static SpendingReport of(YearMonth month, List<SharedExpense> expenses, List<Bill> bills) {
        Map<Category, Money> totals = new EnumMap<>(Category.class);
        Stream.concat(
                expenses.stream().map(e -> Map.entry(e.category(), (Transaction) e)),
                bills.stream().map(b -> Map.entry(b.category(), (Transaction) b)))
                .filter(e -> YearMonth.from(e.getValue().date()).equals(month))
                .forEach(e -> totals.merge(e.getKey(), e.getValue().amount(), Money::plus));
        List<CategoryTotal> sorted = totals.entrySet().stream()
                .map(e -> new CategoryTotal(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(CategoryTotal::total).reversed()) // stable: ties keep Category order
                .toList();
        return new SpendingReport(month, sorted.stream().map(CategoryTotal::total).reduce(Money.ZERO, Money::plus), sorted);
    }

    public YearMonth month() {
        return month;
    }

    public Money total() {
        return total;
    }

    public List<CategoryTotal> byCategory() {
        return byCategory;
    }
}
