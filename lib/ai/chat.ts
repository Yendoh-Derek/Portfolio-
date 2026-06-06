import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { getProfile } from "@/lib/content";
import { getRequestIp } from "@/lib/analytics/request-ip";
import { getSystemPrompt } from "./system-prompt";

export type ChatMessage = { role: "user" | "model"; parts: string };

export async function chatWithGemini(messages: ChatMessage[]): Promise<string> {
  try {
    const headersList = headers();
    const ip = getRequestIp(headersList);

    const { checkRateLimit } = await import("@/lib/analytics/rate-limit");
    const rateLimit = await checkRateLimit(ip);
    if (rateLimit.blocked) {
      return `RATE_LIMIT_EXCEEDED: ${rateLimit.message}`;
    }

    if (!process.env.GEMINI_API_KEY) {
      return "I'm currently in demo mode (API Key missing). Please set GEMINI_API_KEY to enable the assistant.";
    }

    const [systemPrompt, profile] = await Promise.all([
      getSystemPrompt(),
      getProfile(),
    ]);

    const ownerName = profile.personal.name;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.parts }],
      })),
    });

    const lastMessage = messages[messages.length - 1].parts;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return `I am ${ownerName}'s AI Assistant. I can help you learn more about their work, skills, and experience.`;
    }

    return text;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Gemini API Error:", errorMessage);

    if (errorMessage.includes("RATE_LIMIT")) {
      return "I'm processing too many requests. Please wait a moment and try again.";
    }
    if (
      errorMessage.includes("API_KEY") ||
      errorMessage.includes("authentication")
    ) {
      return "I'm having trouble authenticating. Please try again later.";
    }
    return "Sorry, I encountered an error connecting to my brain. Please try again later.";
  }
}
