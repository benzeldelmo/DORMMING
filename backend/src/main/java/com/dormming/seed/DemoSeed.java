package com.dormming.seed;

import com.dormming.controller.dto.SharedExpenseInput;
import com.dormming.model.Category;
import com.dormming.model.Dorm;
import com.dormming.model.Money;
import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.model.split.SplitType;
import com.dormming.service.AuthService;
import com.dormming.service.DormService;
import com.dormming.service.ExpenseService;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Demo data: Benzel is owed ₱1,000 (by Sydney) and owes ₱900 (to Vince). Password: dormming123. */
@Component
@ConditionalOnProperty(name = "dormming.seed", havingValue = "true")
public class DemoSeed implements CommandLineRunner {

    private final AuthService auth;
    private final DormService dorms;
    private final ExpenseService expenses;
    private final Clock clock;

    public DemoSeed(AuthService auth, DormService dorms, ExpenseService expenses, Clock clock) {
        this.auth = auth;
        this.dorms = dorms;
        this.expenses = expenses;
        this.clock = clock;
    }

    @Override
    public void run(String... args) {
        LocalDate today = LocalDate.now(clock);
        User benzel = auth.register("benzel@demo.ph", "dormming123", "Benzel").user();
        User vince = auth.register("vince@demo.ph", "dormming123", "Vince").user();
        User sydney = auth.register("sydney@demo.ph", "dormming123", "Sydney").user();
        UserId b = benzel.id();
        UserId v = vince.id();
        UserId s = sydney.id();

        Dorm dorm = dorms.create(b, "Mabini Hall 3B");
        dorms.join(v, dorm.code().value());
        dorms.join(s, dorm.code().value());

        expenses.addShared(b, new SharedExpenseInput(Money.ofPesos("2000"), Category.FOOD_GROCERIES, "Rice and eggs",
                today.minusDays(2), b, List.of(b, s), SplitType.EQUAL, Map.of(), List.of(), null));
        expenses.addShared(v, new SharedExpenseInput(Money.ofPesos("2700"), Category.FOOD_GROCERIES, "Grocery",
                today.minusDays(1), v, List.of(b, v, s), SplitType.EQUAL, Map.of(), List.of(), null));

    }
}
