package com.dormming.ai;

/** Polymorphism: the demo assistant and Gemini answer the same way. */
public interface AiAssistant {
    AiReply reply(String message, AssistantContext ctx);
}
