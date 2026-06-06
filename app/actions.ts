"use server";

import { chatWithGemini, type ChatMessage } from "@/lib/ai/chat";
import { validateChatMessages } from "@/lib/ai/validation";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .regex(/^(\+233|0)[0-9]{9}$/),
  message: z.string().trim().min(10).max(5000),
});

export type ContactFormResult =
  | { ok: true }
  | { ok: false; error: string };

export async function chatWithGeminiAction(messages: ChatMessage[]) {
  const validated = validateChatMessages(messages);
  if (!validated.ok) {
    return validated.error;
  }

  return chatWithGemini(validated.messages);
}

export async function submitContactForm(
  data: z.infer<typeof contactFormSchema>,
): Promise<ContactFormResult> {
  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Please check your form fields and try again." };
  }

  const accessKey =
    process.env.WEB3FORMS_ACCESS_KEY ??
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.error("Web3Forms access key is not configured");
    return {
      ok: false,
      error: "Contact form is temporarily unavailable. Please email directly.",
    };
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: "New Portfolio Contact Form Submission",
        ...parsed.data,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: "Unable to send your message right now." };
    }

    const result = (await response.json()) as { success?: boolean };
    if (!result.success) {
      return { ok: false, error: "Form submission was not successful." };
    }

    return { ok: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { ok: false, error: "Unable to send your message right now." };
  }
}
