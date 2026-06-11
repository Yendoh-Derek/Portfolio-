import { z } from "zod";

export interface ChatMessage {
  role: "user" | "model";
  parts: string;
}

const chatMessageSchema = z.object({
  role: z.enum(["user", "model"]),
  parts: z.string().trim().min(1).max(2000),
});

const chatRequestSchema = z
  .array(chatMessageSchema)
  .min(1, "At least one message is required")
  .max(40, "Conversation is too long");

export function validateChatMessages(
  messages: ChatMessage[],
): { ok: true; messages: ChatMessage[] } | { ok: false; error: string } {
  const parsed = chatRequestSchema.safeParse(messages);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid messages",
    };
  }

  const last = parsed.data[parsed.data.length - 1];
  if (last.role !== "user") {
    return { ok: false, error: "Last message must be from the user" };
  }

  return { ok: true, messages: parsed.data };
}
