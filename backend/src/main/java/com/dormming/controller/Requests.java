package com.dormming.controller;

import com.dormming.controller.dto.ExpenseDtos.SharedRequest;
import com.dormming.controller.dto.ExpenseDtos.SplitRequest;
import com.dormming.model.Category;
import com.dormming.model.Money;
import com.dormming.model.UserId;
import com.dormming.model.split.ReceiptItem;
import com.dormming.model.split.SplitType;
import com.dormming.service.SharedExpenseInput;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Checks and converts request fields, so missing or unknown values become a 400 with a message. */
final class Requests {
    private Requests() {
    }

    static Money money(Long centavos) {
        if (centavos == null) {
            throw new IllegalArgumentException("Enter an amount");
        }
        return Money.ofCentavos(centavos);
    }

    static Category category(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Pick a category");
        }
        try {
            return Category.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown category");
        }
    }

    static UserId user(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Pick a person");
        }
        return new UserId(id);
    }

    static <E extends Enum<E>> E choice(Class<E> type, String value, String what) {
        if (value == null) {
            throw new IllegalArgumentException("Pick " + what);
        }
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unknown " + what);
        }
    }

    static Map<UserId, Money> amounts(Map<String, Long> raw) {
        Map<UserId, Money> amounts = new LinkedHashMap<>();
        if (raw != null) {
            raw.forEach((id, centavos) -> amounts.put(user(id), money(centavos)));
        }
        return amounts;
    }

    static SharedExpenseInput shared(SharedRequest req) {
        SplitRequest split = req.split() == null ? new SplitRequest("EQUAL", null, null, null) : req.split();
        List<ReceiptItem> items = split.items() == null ? List.of() : split.items().stream()
                .map(i -> new ReceiptItem(i.name(), money(i.priceCentavos()),
                        i.sharerIds() == null ? List.of() : i.sharerIds().stream().map(Requests::user).toList()))
                .toList();
        List<UserId> participants = req.participantIds() == null ? List.of()
                : req.participantIds().stream().map(Requests::user).toList();
        return new SharedExpenseInput(money(req.amountCentavos()), category(req.category()), req.note(), req.date(),
                user(req.payerId()), participants, choice(SplitType.class, split.type(), "how to split"),
                amounts(split.amounts()), items,
                split.extrasCentavos() == null ? Money.ZERO : Money.ofCentavos(split.extrasCentavos()));
    }
}
