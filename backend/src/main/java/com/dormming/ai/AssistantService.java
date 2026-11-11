package com.dormming.ai;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.ledger.Ledger;
import com.dormming.domain.money.Money;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.UserRepository;
import com.dormming.service.BalanceService;
import com.dormming.service.BillInput;
import com.dormming.service.BillService;
import com.dormming.service.DormService;
import com.dormming.service.ExpenseService;
import com.dormming.service.NotFoundException;
import com.dormming.service.UnauthorizedException;
import com.dormming.service.PaymentService;
import com.dormming.service.SharedExpenseInput;
import java.time.Clock;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Chat never saves. Confirm saves through the same services as the normal screens. */
@Service
public class AssistantService {

    private final AiAssistant assistant;
    private final ExpenseService expenses;
    private final BillService bills;
    private final PaymentService payments;
    private final DormService dorms;
    private final BalanceService balances;
    private final UserRepository users;
    private final Clock clock;

    @Autowired
    public AssistantService(DemoAssistant demo, @Value("${GEMINI_API_KEY:}") String geminiKey,
            @Value("${dormming.gemini-model}") String model, ExpenseService expenses, BillService bills,
            PaymentService payments, DormService dorms, BalanceService balances, UserRepository users, Clock clock) {
        this(demo, geminiKey == null || geminiKey.isBlank() ? null : new GeminiAssistant(geminiKey, model, demo),
                expenses, bills, payments, dorms, balances, users, clock);
    }

    public AssistantService(DemoAssistant demo, GeminiAssistant gemini, ExpenseService expenses, BillService bills,
            PaymentService payments, DormService dorms, BalanceService balances, UserRepository users, Clock clock) {
        this.assistant = gemini == null ? demo : gemini;
        this.expenses = expenses;
        this.bills = bills;
        this.payments = payments;
        this.dorms = dorms;
        this.balances = balances;
        this.users = users;
        this.clock = clock;
    }

    public AssistantContext context(UserId userId) {
        User me = users.findById(userId).orElseThrow(() -> new UnauthorizedException("Please log in again"));
        Dorm dorm = dorms.require(userId);
        LocalDate today = LocalDate.now(clock);
        Map<UserId, String> mates = new LinkedHashMap<>();
        users.findAllById(dorm.memberIdsInJoinOrder()).stream().filter(u -> !u.id().equals(userId))
                .forEach(u -> mates.put(u.id(), u.displayName()));
        Ledger ledger = balances.ledgerFor(dorm.id());
        return new AssistantContext(me, mates, ledger.totalOwedTo(userId), ledger.totalOwedBy(userId),
                ledger.debtsInvolving(userId), bills.list(userId, "upcoming", today), today);
    }

    public AiReply chat(UserId user, String message) {
        if (message == null || message.isBlank() || message.length() > 500) {
            throw new IllegalArgumentException("Messages can be 1 to 500 characters");
        }
        return assistant.reply(message, context(user));
    }

    public String confirm(UserId me, ProposedAction action) {
        Map<String, Object> f = action.fields();
        Transaction saved = switch (action.kind()) {
            case ADD_SHARED_EXPENSE -> expenses.addShared(me, new SharedExpenseInput(money(f), category(f),
                    str(f, "note"), date(f, "date"), new UserId(str(f, "payerId")), ids(f.get("participantIds")),
                    SplitType.EQUAL, Map.of(), List.of(), null));
            case CREATE_BILL -> bills.create(me, new BillInput(str(f, "name"), category(f), money(f), date(f, "dueDate"),
                    str(f, "recurrence"), f.get("remindDaysBefore") instanceof Number n ? n.intValue() : 1,
                    SplitType.EQUAL, Map.of()));
            case RECORD_PAYMENT -> payments.record(me, new UserId(str(f, "toUserId")), money(f), str(f, "note"), null);
        };
        Map<UserId, String> names = new LinkedHashMap<>();
        return "Saved: " + saved.describe(id -> names.computeIfAbsent(id,
                k -> users.findById(k).map(User::displayName).orElse("someone")));
    }

    private static Money money(Map<String, Object> f) {
        if (!(f.get("amountCentavos") instanceof Number n)) {
            throw new IllegalArgumentException("Missing amount");
        }
        return Money.ofCentavos(n.longValue());
    }

    private static String str(Map<String, Object> f, String key) {
        Object v = f.get(key);
        return v == null ? "" : v.toString();
    }

    private static Category category(Map<String, Object> f) {
        try {
            return Category.valueOf(str(f, "category"));
        } catch (IllegalArgumentException e) {
            return Category.OTHERS;
        }
    }

    private static LocalDate date(Map<String, Object> f, String key) {
        String v = str(f, key);
        return v.isEmpty() ? null : LocalDate.parse(v);
    }

    private static List<UserId> ids(Object raw) {
        if (!(raw instanceof List<?> list) || list.isEmpty()) {
            throw new IllegalArgumentException("Pick who shares it");
        }
        return list.stream().map(o -> new UserId(o.toString())).toList();
    }
}
