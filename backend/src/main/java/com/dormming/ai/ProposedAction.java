package com.dormming.ai;

import java.util.Map;

/** Something Ming offers to save. Nothing is saved until the user confirms it. */
public record ProposedAction(ActionKind kind, String summary, Map<String, Object> fields) {
}
