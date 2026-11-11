package com.dormming.ai;

import com.dormming.domain.ledger.Debt;
import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.UserId;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

/** Works without an API key: simple keyword rules for the most common requests. */
@Component
public class DemoAssistant implements AiAssistant {

    private static final Pattern AMOUNT = Pattern.compile("₱?\\d[\\d,]*(\\.\\d{1,2})?");
    private static final Pattern NOTE = Pattern.compile("(?:\\bon|\\bfor|\\bbought)\\s+([a-z][a-z ]*?)(?=\\s+(?:₱?\\d|split|with|due)|[.!?]?$)");
    private static final Pattern BILL_NAME = Pattern.compile("([a-z]+)\\s+bill");
    private static final Map<String, Category> KEYWORDS = Map.ofEntries(
            Map.entry("rice", Category.FOOD_GROCERIES), Map.entry("food", Category.FOOD_GROCERIES),
            Map.entry("grocer", Category.FOOD_GROCERIES), Map.entry("lunch", Category.FOOD_GROCERIES),
            Map.entry("dinner", Category.FOOD_GROCERIES), Map.entry("breakfast", Category.FOOD_GROCERIES),
            Map.entry("pizza", Category.FOOD_GROCERIES), Map.entry("snack", Category.FOOD_GROCERIES),
            Map.entry("rent", Category.RENT_UTILITIES), Map.entry("water", Category.RENT_UTILITIES),
            Map.entry("electric", Category.RENT_UTILITIES), Map.entry("load", Category.INTERNET_LOAD),
            Map.entry("wifi", Category.INTERNET_LOAD), Map.entry("internet", Category.INTERNET_LOAD),
            Map.entry("jeep", Category.TRANSPORTATION), Map.entry("grab", Category.TRANSPORTATION),
            Map.entry("fare", Category.TRANSPORTATION), Map.entry("bus", Category.TRANSPORTATION),
            Map.entry("book", Category.SCHOOL), Map.entry("print", Category.SCHOOL), Map.entry("school", Category.SCHOOL),
            Map.entry("medicine", Category.HEALTH), Map.entry("shampoo", Category.PERSONAL_CARE),
            Map.entry("movie", Category.LEISURE));

    @Override
    public AiReply reply(String message, AssistantContext ctx) {
        String text = message == null ? "" : message.strip().toLowerCase(Locale.ROOT);
        Optional<Money> amount = amountIn(text);
        List<UserId> named = dormmatesNamed(text, ctx);

        if (text.contains("who owes me")) {
            return answer(whoOwesMe(ctx));
        }
        if ((text.contains("due") || text.contains("bills")) && text.contains("week")) {
            return answer(dueThisWeek(ctx));
        }
        boolean mentionsSplit = text.contains("split") || text.contains(" with ");
        if ((text.contains("paid ") || text.contains("pay ")) && !text.contains("paid for") && !mentionsSplit
                && !named.isEmpty() && amount.isPresent()) {
            return propose("Okay! Here's the payment to record:", ActionBuilder.payment(named.getFirst(), amount.get(), ctx));
        }
        if (text.contains("bill") && amount.isPresent()) {
            Matcher m = BILL_NAME.matcher(text);
            String name = ActionBuilder.title(m.find() ? m.group(1) : "house");
            String recurrence = text.contains("monthly") || text.contains("every month") ? "MONTHLY"
                    : text.contains("weekly") || text.contains("every week") ? "WEEKLY" : "NONE";
            return propose("I'll set that bill up:", ActionBuilder.bill(name, categoryOf(text), amount.get(),
                    dueDateIn(text, ctx.today()), recurrence));
        }
        boolean spent = text.contains("spent") || text.contains("bought") || text.contains("paid");
        if (spent && amount.isPresent() && mentionsSplit && !named.isEmpty()) {
            List<UserId> people = ActionBuilder.withMeFirst(ctx.me().id(), named);
            return propose("Split it like this?", ActionBuilder.shared(amount.get(), categoryOf(text), noteIn(text),
                    ctx.today(), ctx.me().id(), people, ctx));
        }
        if (spent && amount.isPresent()) {
            return propose("Got it! Save this expense?", ActionBuilder.personal(amount.get(), categoryOf(text),
                    noteIn(text), ctx.today()));
        }
        return answer("Meow! I'm " + ctx.me().mingName() + ". Try \"I spent 150 on rice\", \"Paid Vince 200\" or \"Who owes me?\"");
    }

    private static AiReply answer(String text) {
        return new AiReply(text, Optional.empty(), true);
    }

    private static AiReply propose(String text, ProposedAction action) {
        return new AiReply(text, Optional.of(action), true);
    }

    static Optional<Money> amountIn(String text) {
        Matcher m = AMOUNT.matcher(text);
        while (m.find()) {
            try {
                return Optional.of(Money.ofPesos(m.group()));
            } catch (IllegalArgumentException ignored) {
                // "0" or similar: keep looking
            }
        }
        return Optional.empty();
    }

    private static List<UserId> dormmatesNamed(String text, AssistantContext ctx) {
        List<UserId> found = new ArrayList<>();
        for (String word : text.split("[^a-z]+")) {
            if (!word.isEmpty()) {
                ctx.findDormmate(word).filter(id -> !found.contains(id)).ifPresent(found::add);
            }
        }
        return found;
    }

    static Category categoryOf(String text) {
        return KEYWORDS.entrySet().stream().filter(e -> text.contains(e.getKey())).map(Map.Entry::getValue)
                .findFirst().orElse(Category.OTHERS);
    }

    private static String noteIn(String text) {
        Matcher m = NOTE.matcher(text);
        return m.find() ? m.group(1).strip() : "";
    }

    static LocalDate dueDateIn(String text, LocalDate today) {
        if (text.contains("today")) {
            return today;
        }
        if (text.contains("tomorrow")) {
            return today.plusDays(1);
        }
        for (DayOfWeek day : DayOfWeek.values()) {
            if (text.contains(day.name().toLowerCase(Locale.ROOT))) {
                return today.with(TemporalAdjusters.next(day));
            }
        }
        return today.plusDays(7);
    }

    private static String whoOwesMe(AssistantContext ctx) {
        List<String> lines = ctx.debts().stream().filter(d -> d.to().equals(ctx.me().id()))
                .map(d -> ctx.nameOf(d.from()) + " owes you " + d.amount().format()).toList();
        return lines.isEmpty() ? "Nobody owes you right now. All square!" : String.join(". ", lines) + ".";
    }

    private static String dueThisWeek(AssistantContext ctx) {
        List<String> lines = new ArrayList<>();
        for (Bill bill : ctx.upcomingBills()) {
            if (!bill.dueDate().isAfter(ctx.today().plusDays(7))) {
                Money share = bill.shareOf(ctx.me().id()).map(s -> s.amount()).orElse(Money.ZERO);
                lines.add(bill.name() + " on " + bill.dueDate().getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH)
                        + " (your share " + share.format() + ")");
            }
        }
        return lines.isEmpty() ? "No bills due this week. Nice!" : "Due this week: " + String.join(", ", lines) + ".";
    }

    /** Debts listed for Gemini's context. */
    static String debtsSummary(AssistantContext ctx) {
        List<String> lines = new ArrayList<>();
        for (Debt d : ctx.debts()) {
            lines.add(ctx.nameOf(d.from()) + " owes " + ctx.nameOf(d.to()) + " " + d.amount().format());
        }
        return lines.isEmpty() ? "No open debts." : String.join("; ", lines);
    }
}
