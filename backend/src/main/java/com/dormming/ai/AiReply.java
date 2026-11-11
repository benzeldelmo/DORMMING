package com.dormming.ai;

import java.util.Optional;

public record AiReply(String text, Optional<ProposedAction> proposal, boolean demoMode) {
}
