package com.dormming.web;

import com.dormming.ai.ActionKind;
import com.dormming.ai.AiReply;
import com.dormming.ai.AssistantService;
import com.dormming.ai.ProposedAction;
import com.dormming.auth.CurrentUser;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    public record ChatRequest(String message) {
    }

    public record ChatResponse(String reply, boolean demoMode, ProposedAction proposal) {
    }

    public record ConfirmRequest(String kind, String summary, Map<String, Object> fields) {
    }

    public record ConfirmResponse(String reply) {
    }

    private final AssistantService assistant;

    public AssistantController(AssistantService assistant) {
        this.assistant = assistant;
    }

    @PostMapping("/chat")
    ChatResponse chat(@AuthenticationPrincipal Jwt jwt, @RequestBody ChatRequest req) {
        AiReply reply = assistant.chat(CurrentUser.id(jwt), req.message());
        return new ChatResponse(reply.text(), reply.demoMode(), reply.proposal().orElse(null));
    }

    @PostMapping("/confirm")
    ConfirmResponse confirm(@AuthenticationPrincipal Jwt jwt, @RequestBody ConfirmRequest req) {
        ActionKind kind = Requests.choice(ActionKind.class, req.kind(), "an action");
        return new ConfirmResponse(assistant.confirm(CurrentUser.id(jwt),
                new ProposedAction(kind, req.summary(), req.fields() == null ? Map.of() : req.fields())));
    }
}
