package com.dormming.ai;

import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.UserId;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Builds proposals with the same field names the API uses, so Confirm can reuse the normal services. */
final class ActionBuilder {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("EEE, MMM d", Locale.ENGLISH);

    private ActionBuilder() {
    }

    static String title(String note) {
        return note == null || note.isBlank() ? "" : note.substring(0, 1).toUpperCase(Locale.ROOT) + note.substring(1);
    }

    static ProposedAction personal(Money amount, Category category, String note, LocalDate date) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("amountCentavos", amount.centavos());
        f.put("category", category.name());
        f.put("note", title(note));
        f.put("date", date.toString());
        String what = note == null || note.isBlank() ? category.label() : note + " (" + category.label() + ")";
        return new ProposedAction(ActionKind.ADD_PERSONAL_EXPENSE, "Add " + amount.format() + " for " + what, f);
    }

    static ProposedAction shared(Money amount, Category category, String note, LocalDate date, UserId payer,
            List<UserId> participants, AssistantContext ctx) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("amountCentavos", amount.centavos());
        f.put("category", category.name());
        f.put("note", title(note));
        f.put("date", date.toString());
        f.put("payerId", payer.value());
        f.put("participantIds", participants.stream().map(UserId::value).toList());
        List<String> others = participants.stream().filter(p -> !p.equals(payer)).map(ctx::nameOf).toList();
        String what = note == null || note.isBlank() ? category.label() : note;
        return new ProposedAction(ActionKind.ADD_SHARED_EXPENSE,
                "Add " + amount.format() + " for " + what + ", split equally with " + String.join(" and ", others), f);
    }

    static ProposedAction bill(String name, Category category, Money amount, LocalDate dueDate, String recurrence) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("name", name);
        f.put("category", category.name());
        f.put("amountCentavos", amount.centavos());
        f.put("dueDate", dueDate.toString());
        f.put("recurrence", recurrence);
        f.put("remindDaysBefore", 1);
        String repeats = switch (recurrence) {
            case "MONTHLY" -> ", repeats monthly";
            case "WEEKLY" -> ", repeats weekly";
            default -> "";
        };
        return new ProposedAction(ActionKind.CREATE_BILL,
                "Create " + name + " bill " + amount.format() + " due " + DAY.format(dueDate) + repeats, f);
    }

    static ProposedAction payment(UserId to, Money amount, AssistantContext ctx) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("toUserId", to.value());
        f.put("amountCentavos", amount.centavos());
        f.put("note", "");
        return new ProposedAction(ActionKind.RECORD_PAYMENT,
                "Record that you paid " + ctx.nameOf(to) + " " + amount.format(), f);
    }

    static List<UserId> withMeFirst(UserId me, List<UserId> others) {
        List<UserId> people = new ArrayList<>();
        people.add(me);
        others.stream().filter(o -> !o.equals(me) && !people.contains(o)).forEach(people::add);
        return people;
    }
}
