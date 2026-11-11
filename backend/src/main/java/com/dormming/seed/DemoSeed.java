package com.dormming.seed;

import com.dormming.auth.LocalAuthProvider;
import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.money.Money;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.service.BillInput;
import com.dormming.service.BillService;
import com.dormming.service.DormService;
import com.dormming.service.ExpenseService;
import com.dormming.service.FriendService;
import com.dormming.service.SharedExpenseInput;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/** Demo data matching the Figma mockups: Benzel is owed ₱1,000 and owes ₱900. Password: dormming123. */
@Component
@Profile("local")
@ConditionalOnProperty(name = "dormming.seed", havingValue = "true")
public class DemoSeed implements CommandLineRunner {

    private final LocalAuthProvider auth;
    private final DormService dorms;
    private final ExpenseService expenses;
    private final BillService bills;
    private final FriendService friends;
    private final Clock clock;

    public DemoSeed(LocalAuthProvider auth, DormService dorms, ExpenseService expenses, BillService bills,
            FriendService friends, Clock clock) {
        this.auth = auth;
        this.dorms = dorms;
        this.expenses = expenses;
        this.bills = bills;
        this.friends = friends;
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

        friends.connect(b, vince.friendCode().value());
        Dorm dorm = dorms.create(b, "Mabini Hall 3B");
        dorms.join(v, dorm.code().value());
        dorms.join(s, dorm.code().value());

        expenses.addShared(b, new SharedExpenseInput(Money.ofPesos("2000"), Category.FOOD_GROCERIES, "Rice and eggs",
                today.minusDays(2), b, List.of(b, s), SplitType.EQUAL, Map.of(), List.of(), null));
        expenses.addShared(v, new SharedExpenseInput(Money.ofPesos("2700"), Category.FOOD_GROCERIES, "Grocery",
                today.minusDays(1), v, List.of(b, v, s), SplitType.EQUAL, Map.of(), List.of(), null));
        expenses.addPersonal(b, Money.ofPesos("85"), Category.TRANSPORTATION, "Jeep fare", today);

        bills.create(b, new BillInput("Internet", Category.INTERNET_LOAD, Money.ofPesos("1500"), today.plusDays(1),
                "MONTHLY", 1, SplitType.EQUAL, Map.of()));
        bills.create(b, new BillInput("Water", Category.RENT_UTILITIES, Money.ofPesos("1000"), today.plusDays(5),
                "MONTHLY", 1, SplitType.EQUAL, Map.of()));
    }
}
