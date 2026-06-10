"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2 } from "lucide-react";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { cn } from "@/lib/utils";
import { useProfile } from "@/components/profile-provider";
import { DEFAULT_CHAT_SUGGESTIONS } from "@/lib/constants/chat-suggestions";
import ReactMarkdown from "react-markdown";
import FocusTrap from "focus-trap-react";

interface Message {
  role: "user" | "model";
  parts: string;
}

export function Chatbot({
  isOpen,
  onClose,
  suggestions = [...DEFAULT_CHAT_SUGGESTIONS],
  prefillInput = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  suggestions?: string[];
  prefillInput?: string;
}) {
  const { personal } = useProfile();
  const firstName = (personal.shortName || personal.name).split(" ")[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [displayedTexts, setDisplayedTexts] = useState<Record<number, string>>(
    {},
  );
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  useEffect(() => {
    if (prefillInput && isOpen) {
      setInput(prefillInput);
    }
  }, [prefillInput, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  async function handleSend(text: string = input) {
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user" as const, parts: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setSendError(null);

    try {
      // Add placeholder message for AI response
      const messageIndex = newMessages.length;
      setMessages([...newMessages, { role: "model", parts: "" }]);

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          const errorType = errorText
            .replace("RATE_LIMIT_EXCEEDED:", "")
            .trim();
          if (errorType === "SESSION_LIMIT_REACHED") {
            const limitMessage = `
⚠️ **You've reached the chat limit for this session.**

Interested in working together?

[BOOK_CONSULTATION]
            `.trim();
            setMessages((prev) => {
              const updated = [...prev];
              updated[messageIndex] = { role: "model", parts: limitMessage };
              return updated;
            });
          } else {
            setMessages((prev) => {
              const updated = [...prev];
              updated[messageIndex] = {
                role: "model",
                parts: `⚠️ **System Alert:** ${errorType}`,
              };
              return updated;
            });
          }
        } else {
          throw new Error(errorText);
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setIsLoading(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                setSendError(parsed.error);
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[messageIndex] = {
                    role: "model",
                    parts: `Error: ${parsed.error}`,
                  };
                  return updated;
                });
                setIsLoading(false);
                return;
              }

              if (parsed.text) {
                fullText += parsed.text;
                // Update message with streaming text (typewriter effect)
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[messageIndex] = { role: "model", parts: fullText };
                  return updated;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      console.error("[Chatbot] send failed:", err);
      setSendError("Unable to reach the assistant. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusTrap active={isOpen}>
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-0 right-0 mx-auto md:left-auto md:right-8 md:bottom-4 md:mx-0 w-[85vw] md:w-[400px] h-[65dvh] md:h-[600px] md:max-h-[80vh] min-h-[400px] bg-[#050505]/95 backdrop-blur-xl rounded-[1.5rem] flex flex-col shadow-2xl z-50 overflow-hidden border border-white/20 ring-1 ring-white/5"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 backdrop-blur-md flex justify-between items-center border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <SparkleIcon
                    size={18}
                    className="text-primary animate-pulse"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {firstName}&apos;s AI Agent
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close assistant"
              >
                <X size={18} className="text-white/70" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center mt-6 text-white/50 space-y-4">
                  <SparkleIcon
                    size={40}
                    className="mx-auto text-primary opacity-80 animate-pulse"
                  />
                  <div className="space-y-1 px-4">
                    <p className="font-bold text-white text-base">
                      Hi! I&apos;m {firstName}&apos;s AI Agent.
                    </p>
                    <p className="text-xs text-white/60">
                      Ask me anything about his technical projects, ML skills,
                      or work background.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 px-4">
                    {suggestions.map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(chip)}
                        className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-xs text-white/80 hover:text-white transition-all duration-300 flex items-center justify-between group/chip"
                      >
                        <span>{chip}</span>
                        <Send
                          size={10}
                          className="opacity-0 group-hover/chip:opacity-100 transition-opacity text-primary"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-white/10" : "bg-primary/20",
                    )}
                  >
                    {msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <SparkleIcon size={14} />
                    )}
                  </div>
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl text-sm leading-relaxed overflow-hidden shadow-md",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-primary to-[#7b2cbf] text-white rounded-tr-none shadow-[0_4px_12px_rgba(138,43,226,0.2)]"
                        : "bg-[#0d0720]/80 text-white/95 border border-white/10 rounded-tl-none backdrop-blur-md",
                    )}
                  >
                    {msg.role === "user" ? (
                      msg.parts
                    ) : (
                      <div className="space-y-4">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => {
                              if (
                                Array.isArray(children) &&
                                children.some(
                                  (child) =>
                                    typeof child === "string" &&
                                    child.includes("[BOOK_CONSULTATION]"),
                                )
                              ) {
                                return null;
                              }
                              if (
                                typeof children === "string" &&
                                children.includes("[BOOK_CONSULTATION]")
                              ) {
                                return null;
                              }
                              return (
                                <p className="mb-2 last:mb-0">{children}</p>
                              );
                            },
                            ul: ({ children }) => (
                              <ul className="list-disc pl-4 mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-4 mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => (
                              <span className="font-bold text-white">
                                {children}
                              </span>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-300 underline hover:text-[#00f0ff]"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {msg.parts}
                        </ReactMarkdown>

                        {msg.parts.includes("[BOOK_CONSULTATION]") && (
                          <button
                            onClick={() => {
                              onClose();
                              setTimeout(() => {
                                const el = document.getElementById("contact");
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth" });
                                } else {
                                  window.location.href = "/#contact";
                                }
                              }, 300);
                            }}
                            className="w-full group relative px-4 py-2.5 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 text-sm shadow-[0_4px_15px_rgba(138,43,226,0.3)] hover:shadow-[0_8px_25px_rgba(138,43,226,0.5)] active:scale-95"
                          >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <SparkleIcon size={16} className="relative z-10" />
                            <span className="relative z-10">
                              Book a Consultation
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 mr-auto">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <SparkleIcon size={14} />
                  </div>
                  <div className="bg-[#0d0720]/80 border border-white/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              {sendError && (
                <p className="mb-3 text-xs text-red-300 text-center">
                  {sendError}
                </p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <input
                  id="chatbot-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  autoComplete="off"
                  placeholder="Ask me anything..."
                  className="flex-1 bg-black/40 border border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-full px-4 py-2 text-sm text-white focus:outline-none placeholder:text-white/30 transition-all"
                  aria-label="Message to AI Assistant"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#7b2cbf] hover:shadow-[0_0_15px_rgba(138,43,226,0.5)] flex items-center justify-center text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-white/30 text-center mt-2 font-mono">
                Notice: No data from this conversation is stored.
              </p>
            </div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>
  );
}
