package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.split.ReceiptItem;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.user.UserId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ExpenseServiceTest {

    World w = new World();

    SharedExpenseInput equal(long amount, String note, UserId payer, List<UserId> people) {
        return new SharedExpenseInput(c(amount), Category.FOOD_GROCERIES, note, w.today, payer, people, SplitType.EQUAL,
                Map.of(), List.of(), null);
    }

    @Test
    void addsEqualSharedExpense() {
        w.dormOfThree();
        SharedExpense e = w.expenses.addShared(w.a, equal(30000, "Pizza", w.a, List.of(w.c, w.b, w.a)));
        assertThat(e.shares()).containsEntry(w.a, c(10000)).containsEntry(w.b, c(10000)).containsEntry(w.c, c(10000));
        assertThat(e.participants()).containsExactly(w.a, w.b, w.c); // reordered to join order
        assertThat(w.transactions.findById(e.id())).isPresent();
    }

    @Test
    void rejectsParticipantOutsideDorm() {
        w.dormOfThree();
        UserId outsider = w.user("z", "Zed");
        assertThatThrownBy(() -> w.expenses.addShared(w.a, equal(30000, "", w.a, List.of(w.a, outsider))))
                .hasMessage("Everyone in the split must be in your dorm");
    }

    @Test
    void onlyAuthorOrCreatorCanEdit() {
        w.dormOfThree();
        SharedExpense byA = w.expenses.addShared(w.a, equal(30000, "", w.a, List.of(w.a, w.b)));
        SharedExpense byB = w.expenses.addShared(w.b, equal(30000, "", w.b, List.of(w.a, w.b)));
        assertThatThrownBy(() -> w.expenses.updateShared(w.b, byA.id(), equal(20000, "", w.a, List.of(w.a, w.b))))
                .isInstanceOf(NotAllowedException.class);
        SharedExpense edited = w.expenses.updateShared(w.a, byB.id(), equal(20000, "", w.b, List.of(w.a, w.b)));
        assertThat(edited.amount()).isEqualTo(c(20000));
        assertThat(edited.createdBy()).isEqualTo(w.b);
        assertThatThrownBy(() -> w.expenses.delete(w.c, byB.id())).isInstanceOf(NotAllowedException.class);
    }

    @Test
    void itemizedMismatchIsRejected() {
        w.dormOfThree();
        var input = new SharedExpenseInput(c(9000), Category.FOOD_GROCERIES, "", w.today, w.a, List.of(w.a, w.b),
                SplitType.ITEMIZED, Map.of(), List.of(new ReceiptItem("Rice", c(10000), List.of(w.a, w.b))), c(0));
        assertThatThrownBy(() -> w.expenses.addShared(w.a, input)).hasMessageContaining("add up");
    }

    @Test
    void searchesByNoteOrCategory() {
        w.dormOfThree();
        w.expenses.addShared(w.a, equal(30000, "Grocery", w.a, List.of(w.a, w.b)));
        w.expenses.addShared(w.a, new SharedExpenseInput(c(5000), Category.TRANSPORTATION, "Grab", w.today, w.a,
                List.of(w.a, w.b), SplitType.EQUAL, Map.of(), List.of(), null));
        w.expenses.addPersonal(w.a, c(8500), Category.TRANSPORTATION, "Jeep fare", w.today);
        assertThat(w.expenses.list(w.a, "shared", "groc")).extracting(t -> t.note()).containsExactly("Grocery");
        assertThat(w.expenses.list(w.a, "all", "transport")).hasSize(2);
        assertThat(w.expenses.list(w.a, "personal", null)).hasSize(1);
    }

    @Test
    void activityShowsDormRecordsNewestFirst() {
        Dorm dorm = w.dormOfThree();
        w.expenses.addPersonal(w.b, c(100), Category.OTHERS, "B's own", w.today);
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b));
        w.payment(dorm, w.b, w.a, 5000);
        assertThat(w.activity.recent(w.a, 10)).hasSize(2); // b's personal expense is private
    }
}
