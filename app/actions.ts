"use server";

import { chatWithGemini, type ChatMessage } from "@/lib/ai/chat";
import { validateChatMessages } from "@/lib/ai/validation";
import { z } from "zod";

export async function chatWithGeminiAction(
  messages: ChatMessage[],
  sessionId: string,
) {
  const validated = validateChatMessages(messages);
  if (!validated.ok) {
    return validated.error;
  }

  return chatWithGemini(validated.messages, sessionId);
}

