import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildRequestPrompt } from "@/lib/ai/system-prompt";
import { checkRateLimit } from "@/lib/analytics/rate-limit";
import { validateChatMessages, type ChatMessage } from "@/lib/ai/validation";

const MAX_MESSAGE_LIMIT = 40;

async function sendMessageWithRetry(
  chat: ReturnType<ReturnType<typeof GoogleGenerativeAI.prototype.getGenerativeModel>["startChat"]>,
  message: string,
  maxRetries = 2,
  signal?: AbortSignal,
) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await chat.sendMessageStream(message, { signal });
    } catch (error) {
      if (signal?.aborted) throw error; // don't retry aborted requests
      const msg = error instanceof Error ? error.message : "";
      const isRetryable =
        msg.includes("503") ||
        msg.includes("Service Unavailable") ||
        msg.includes("overloaded");
      if (isRetryable && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

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

    // Check message limit
    if (validated.messages.length > MAX_MESSAGE_LIMIT) {
      return new Response(
        "MESSAGE_LIMIT_EXCEEDED: Too many messages in this conversation. Please clear the chat to continue.",
        {
          status: 413,
        },
      );
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

    const systemPrompt = await buildRequestPrompt(validated.messages);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: validated.messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.parts }],
      })),
    });

    const lastMessage = validated.messages[validated.messages.length - 1].parts;

    // Handle errors that occur before the stream starts
    let result;
    try {
      result = await sendMessageWithRetry(chat, lastMessage, 2, request.signal);
    } catch (error) {
      console.error("Chat send error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Create a stream that sends the error
      const encoder = new TextEncoder();
      const errorStream = new ReadableStream({
        start(controller) {
          if (
            errorMessage.includes("503") ||
            errorMessage.includes("Service Unavailable")
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "The AI is currently experiencing high demand. Please try again later." })}\n\n`,
              ),
            );
          } else if (errorMessage.includes("RATE_LIMIT")) {
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
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(errorStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

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
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          console.error("Stream error:", errorMessage);

          if (
            errorMessage.includes("503") ||
            errorMessage.includes("Service Unavailable")
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "The AI is currently experiencing high demand. Please try again later." })}\n\n`,
              ),
            );
          } else if (errorMessage.includes("RATE_LIMIT")) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "I'm processing too many requests. Please wait a moment and try again." })}\n\n`,
              ),
            );
          } else if (
            errorMessage.includes("Failed to parse stream") ||
            errorMessage.includes("parse stream")
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ error: "I encountered a streaming error while parsing the response. Please try again." })}\n\n`,
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
        } finally {
          controller.close();
          request.signal.removeEventListener("abort", abortHandler);
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
