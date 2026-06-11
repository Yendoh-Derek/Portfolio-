import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "@/lib/ai/system-prompt";
import { checkRateLimit } from "@/lib/analytics/rate-limit";
import { validateChatMessages, type ChatMessage } from "@/lib/ai/validation";

export async function POST(request: Request) {
  try {
    const { messages, sessionId } = await request.json();

    // Validate input
    if (!Array.isArray(messages) || !sessionId) {
      return new Response("Invalid request", { status: 400 });
    }

    const validated = validateChatMessages(messages as ChatMessage[]);
    if (!validated.ok) {
      return new Response(validated.error, { status: 400 });
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(sessionId);
    if (rateLimit.blocked) {
      return new Response(`RATE_LIMIT_EXCEEDED: ${rateLimit.message}`, {
        status: 429,
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return new Response(
        "I'm currently in demo mode (API Key missing). Please set GEMINI_API_KEY to enable the assistant.",
        { status: 500 },
      );
    }

    const systemPrompt = await getSystemPrompt();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: validated.messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.parts }],
      })),
    });

    const lastMessage = validated.messages[validated.messages.length - 1].parts;
    const result = await chat.sendMessageStream(lastMessage);

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const abortHandler = () => {
          try {
            controller.close();
          } catch {}
        };
        request.signal.addEventListener("abort", abortHandler, { once: true });

        try {
          for await (const chunk of result.stream) {
            if (request.signal.aborted) break;
            const text = chunk.text();
            if (text) {
              // Encode the chunk and send it
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          }

          // Send completion signal
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Stream error:", errorMessage);

          if (errorMessage.includes("RATE_LIMIT")) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "I'm processing too many requests. Please wait a moment and try again." })}\n\n`,
              ),
            );
          } else if (
            errorMessage.includes("API_KEY") ||
            errorMessage.includes("authentication")
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "I'm having trouble authenticating. Please try again later." })}\n\n`,
              ),
            );
          } else {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "Sorry, I encountered an error. Please try again later." })}\n\n`,
              ),
            );
          }

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
