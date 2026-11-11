package com.dormming.ai;

import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.user.UserId;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Asks Google Gemini for a reply plus an optional structured action. The answer goes through
 * the same builders as the demo assistant, so validation and confirm-before-save are identical.
 */
public class GeminiAssistant implements AiAssistant {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    private final String apiKey;
    private final String model;
    private final DemoAssistant fallback;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public GeminiAssistant(String apiKey, String model, DemoAssistant fallback) {
        this.apiKey = apiKey;
        this.model = model;
        this.fallback = fallback;
    }

    @Override
    public AiReply reply(String message, AssistantContext ctx) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent"))
                    .timeout(Duration.ofSeconds(25))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(JSON.writeValueAsString(requestBody(message, ctx))))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return unavailable(message, ctx);
            }
            return parse(response.body(), ctx, fallback);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return unavailable(message, ctx);
        } catch (Exception e) {
            return unavailable(message, ctx);
        }
    }

    private AiReply unavailable(String message, AssistantContext ctx) {
        AiReply demo = fallback.reply(message, ctx);
        return new AiReply("(Gemini unavailable) " + demo.text(), demo.proposal(), true);
    }

    private static Map<String, Object> requestBody(String message, AssistantContext ctx) {
        String system = """
                You are %s, a friendly orange cat who helps college students in a dorm track shared money.
                Money is Philippine pesos. Today is %s. The user is %s. Dormmates: %s.
                Owed to the user: %s. The user owes: %s. Debts: %s.
                Upcoming bills: %s.
                Reply briefly and warmly. If the user wants to record something, also fill "action" with one of:
                ADD_PERSONAL_EXPENSE (amountPesos, category, note), ADD_SHARED_EXPENSE (amountPesos, category, note,
                participantNames: dormmates sharing it, the user is added automatically), CREATE_BILL (name,
                amountPesos, category, dueDate as YYYY-MM-DD, recurrence), RECORD_PAYMENT (toName, amountPesos).
                Never claim something is saved: the user confirms it in the app.
                """.formatted(ctx.me().mingName(), ctx.today(), ctx.me().displayName(),
                String.join(", ", ctx.dormmates().values()), ctx.owedToMe().format(), ctx.iOwe().format(),
                DemoAssistant.debtsSummary(ctx),
                ctx.upcomingBills().stream().map(b -> b.name() + " " + b.amount().format() + " due " + b.dueDate()).toList());
        List<String> categories = Arrays.stream(Category.values()).map(Enum::name).toList();
        Map<String, Object> action = Map.of("type", "OBJECT", "nullable", true, "required", List.of("kind"),
                "properties", Map.of(
                        "kind", Map.of("type", "STRING", "enum", Arrays.stream(ActionKind.values()).map(Enum::name).toList()),
                        "amountPesos", Map.of("type", "NUMBER"),
                        "category", Map.of("type", "STRING", "enum", categories),
                        "note", Map.of("type", "STRING"),
                        "participantNames", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")),
                        "toName", Map.of("type", "STRING"),
                        "name", Map.of("type", "STRING"),
                        "dueDate", Map.of("type", "STRING"),
                        "recurrence", Map.of("type", "STRING", "enum", List.of("NONE", "WEEKLY", "MONTHLY"))));
        Map<String, Object> schema = Map.of("type", "OBJECT", "required", List.of("reply"),
                "properties", Map.of("reply", Map.of("type", "STRING"), "action", action));
        return Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", system))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", message)))),
                "generationConfig", Map.of("responseMimeType", "application/json", "responseSchema", schema));
    }

    /** Reads Gemini's response. Actions that don't make sense (unknown name, bad amount) are dropped. */
    static AiReply parse(String responseBody, AssistantContext ctx, DemoAssistant fallback) {
        JsonNode text = JSON.readTree(responseBody).path("candidates").path(0).path("content").path("parts").path(0).path("text");
        JsonNode answer = JSON.readTree(text.asString());
        String reply = answer.path("reply").asString();
        Optional<ProposedAction> action = Optional.empty();
        try {
            action = toAction(answer.path("action"), ctx);
        } catch (IllegalArgumentException e) {
            reply = reply + " (I couldn't fill that in: " + e.getMessage() + ")";
        }
        return new AiReply(reply, action, false);
    }

    private static Optional<ProposedAction> toAction(JsonNode a, AssistantContext ctx) {
        if (a.isMissingNode() || a.isNull() || a.path("kind").isMissingNode()) {
            return Optional.empty();
        }
        ActionKind kind = ActionKind.valueOf(a.path("kind").asString());
        Money amount = Money.ofPesos(a.path("amountPesos").decimalValue().toPlainString());
        Category category = a.hasNonNull("category") ? Category.valueOf(a.path("category").asString()) : Category.OTHERS;
        String note = a.path("note").asString("");
        return Optional.of(switch (kind) {
            case ADD_PERSONAL_EXPENSE -> ActionBuilder.personal(amount, category, note, ctx.today());
            case ADD_SHARED_EXPENSE -> {
                List<UserId> named = new ArrayList<>();
                for (JsonNode n : a.path("participantNames")) {
                    named.add(ctx.findDormmate(n.asString()).orElseThrow(
                            () -> new IllegalArgumentException(n.asString() + " isn't in your dorm")));
                }
                yield ActionBuilder.shared(amount, category, note, ctx.today(), ctx.me().id(),
                        ActionBuilder.withMeFirst(ctx.me().id(), named), ctx);
            }
            case CREATE_BILL -> ActionBuilder.bill(ActionBuilder.title(a.path("name").asString("Bill")), category, amount,
                    a.hasNonNull("dueDate") ? LocalDate.parse(a.path("dueDate").asString()) : ctx.today().plusDays(7),
                    a.path("recurrence").asString("NONE"));
            case RECORD_PAYMENT -> ActionBuilder.payment(ctx.findDormmate(a.path("toName").asString(""))
                    .orElseThrow(() -> new IllegalArgumentException("I don't know who you paid")), amount, ctx);
        });
    }
}
