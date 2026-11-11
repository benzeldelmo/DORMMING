package com.dormming.ai;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.dorm.Dorm;
import com.dormming.service.World;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AssistantTest {

    World w = new World();

    AiReply ask(String message) {
        return w.assistant.chat(w.a, message);
    }

    @Test
    void personalExpense() {
        w.dormOfThree();
        var p = ask("I spent 150 on rice").proposal().orElseThrow();
        assertThat(p.kind()).isEqualTo(ActionKind.ADD_PERSONAL_EXPENSE);
        assertThat(p.fields()).containsEntry("amountCentavos", 15000L).containsEntry("category", "FOOD_GROCERIES");
    }

    @Test
    void payment() {
        w.dormOfThree();
        var p = ask("paid Vince 200").proposal().orElseThrow();
        assertThat(p.kind()).isEqualTo(ActionKind.RECORD_PAYMENT);
        assertThat(p.fields()).containsEntry("toUserId", "b").containsEntry("amountCentavos", 20000L);
    }

    @Test
    void sharedExpense() {
        w.dormOfThree();
        var p = ask("bought pizza 600 split with Vince and Sydney").proposal().orElseThrow();
        assertThat(p.kind()).isEqualTo(ActionKind.ADD_SHARED_EXPENSE);
        assertThat(p.fields()).containsEntry("participantIds", List.of("a", "b", "c")).containsEntry("payerId", "a");
    }

    @Test
    void bill() {
        w.dormOfThree();
        var p = ask("internet bill 1500 due tomorrow monthly").proposal().orElseThrow();
        assertThat(p.kind()).isEqualTo(ActionKind.CREATE_BILL);
        assertThat(p.fields()).containsEntry("name", "Internet").containsEntry("dueDate", "2026-11-12")
                .containsEntry("recurrence", "MONTHLY").containsEntry("category", "INTERNET_LOAD");
    }

    @Test
    void whoOwesMeAnswersWithoutProposal() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 100000, List.of(w.a, w.b)); // Vince owes 500
        AiReply reply = ask("who owes me?");
        assertThat(reply.proposal()).isEmpty();
        assertThat(reply.text()).contains("Vince").contains("₱500.00");
        assertThat(reply.demoMode()).isTrue();
    }

    @Test
    void chatNeverSaves() {
        Dorm dorm = w.dormOfThree();
        ask("I spent 150 on rice");
        ask("paid Vince 200");
        assertThat(w.transactions.personalByUser(w.a)).isEmpty();
        assertThat(w.transactions.paymentsByDorm(dorm.id())).isEmpty();
    }

    @Test
    void confirmSavesAndValidatesLikeManualEntry() {
        Dorm dorm = w.dormOfThree();
        String saved = w.assistant.confirm(w.a, ask("I spent 150 on rice").proposal().orElseThrow());
        assertThat(saved).startsWith("Saved:");
        assertThat(w.transactions.personalByUser(w.a)).hasSize(1);
        w.sharedEqual(dorm, w.b, 20000, List.of(w.a, w.b)); // a owes b 100
        var tooMuch = new ProposedAction(ActionKind.RECORD_PAYMENT, "",
                Map.of("toUserId", "b", "amountCentavos", 50000L));
        assertThatThrownBy(() -> w.assistant.confirm(w.a, tooMuch)).hasMessage("That's more than you owe (₱100.00)");
    }

    @Test
    void readsGeminiJsonIntoTheSameProposal() {
        w.dormOfThree();
        AssistantContext ctx = w.assistant.context(w.a);
        String body = """
                {"candidates":[{"content":{"parts":[{"text":"{\\"reply\\":\\"Got it!\\",\\"action\\":{\\"kind\\":\\"RECORD_PAYMENT\\",\\"amountPesos\\":200,\\"toName\\":\\"vince\\"}}"}]}}]}""";
        AiReply reply = GeminiAssistant.parse(body, ctx, new DemoAssistant());
        assertThat(reply.text()).isEqualTo("Got it!");
        assertThat(reply.demoMode()).isFalse();
        assertThat(reply.proposal().orElseThrow().fields()).containsEntry("toUserId", "b").containsEntry("amountCentavos", 20000L);
    }
}
