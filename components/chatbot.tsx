"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2 } from "lucide-react";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { cn } from "@/lib/utils";
import { useProfile } from "@/components/profile-provider";
import { DEFAULT_CHAT_SUGGESTIONS } from "@/lib/constants/chat-suggestions";
import ReactMarkdown from "react-markdown";
import FocusTrap from "focus-trap-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const firstName = (personal.shortName || personal.name).split(" ")[0];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [trapContainer, setTrapContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollLockStateRef = useRef<{
    scrollY: number;
    htmlOverflow: string;
    bodyOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyWidth: string;
    bodyPaddingRight: string;
  } | null>(null);

  useEffect(() => {
    let sid = localStorage.getItem("chat_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("chat_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Auto-focus input when chatbot opens
  useEffect(() => {
    if (!isOpen) return;

    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (prefillInput && isOpen) {
      setInput(prefillInput);
    }
  }, [prefillInput, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Prevent scroll on body when chatbot is open (including iOS Safari)
  useEffect(() => {
    if (!isOpen) {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      if (scrollLockStateRef.current) {
        const state = scrollLockStateRef.current;
        scrollLockStateRef.current = null;

        document.documentElement.style.overflow = state.htmlOverflow;
        document.body.style.overflow = state.bodyOverflow;
        document.body.style.position = state.bodyPosition;
        document.body.style.top = state.bodyTop;
        document.body.style.width = state.bodyWidth;
        document.body.style.paddingRight = state.bodyPaddingRight;
        window.scrollTo(0, state.scrollY);
      }

      const launcher = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Open AI assistant"]',
      );
      launcher?.focus({ preventScroll: true });

      return;
    }

    const scrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    scrollLockStateRef.current = {
      scrollY,
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyWidth: document.body.style.width,
      bodyPaddingRight: document.body.style.paddingRight,
    };

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;

      if (scrollLockStateRef.current) {
        const state = scrollLockStateRef.current;
        scrollLockStateRef.current = null;

        document.documentElement.style.overflow = state.htmlOverflow;
        document.body.style.overflow = state.bodyOverflow;
        document.body.style.position = state.bodyPosition;
        document.body.style.top = state.bodyTop;
        document.body.style.width = state.bodyWidth;
        document.body.style.paddingRight = state.bodyPaddingRight;
        window.scrollTo(0, state.scrollY);
      }
    };
  }, [isOpen]);

  async function handleSend(text: string = input) {
    if (!text.trim() || isLoading) return;

    const sid =
      sessionId ||
      localStorage.getItem("chat_session_id") ||
      crypto.randomUUID();
    if (!sessionId) {
      localStorage.setItem("chat_session_id", sid);
      setSessionId(sid);
    }

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const newMessages = [...messages, { role: "user" as const, parts: text }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setSendError(null);

    const messageIndex = newMessages.length;

    try {
      // Add placeholder message for AI response
      setMessages([...newMessages, { role: "model", parts: "" }]);

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, sessionId: sid }),
        signal: abortController.signal,
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
        } else if (response.status === 413) {
          const limitMessage = `
⚠️ **You've reached the conversation length limit!**

Please clear the chat to continue.
            `.trim();
          setMessages((prev) => {
            const updated = [...prev];
            updated[messageIndex] = { role: "model", parts: limitMessage };
            return updated;
          });
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
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (true) {
          const newlineIndex = buffer.indexOf("\n");
          if (newlineIndex === -1) break;

          const rawLine = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          const line = rawLine.trim();
          if (!line) continue;
          if (!line.startsWith("data:")) continue;

          const data = line.slice(5).trimStart();
          if (data === "[DONE]") {
            setIsLoading(false);
            abortControllerRef.current = null;
            return;
          }

          try {
            const parsed = JSON.parse(data) as {
              text?: string;
              error?: string;
            };
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
              abortControllerRef.current = null;
              return;
            }

            if (parsed.text) {
              fullText += parsed.text;
              setMessages((prev) => {
                const updated = [...prev];
                updated[messageIndex] = { role: "model", parts: fullText };
                return updated;
              });
            }
          } catch {
            continue;
          }
        }
      }

      setIsLoading(false);
      abortControllerRef.current = null;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setIsLoading(false);
        return;
      }
      console.error("[Chatbot] send failed:", err);
      setSendError("Unable to reach the assistant. Please try again.");
      setMessages((prev) => {
        const updated = [...prev];
        if (updated[messageIndex]?.role === "model") {
          updated[messageIndex] = {
            role: "model",
            parts: "Sorry — something went wrong. Please try again.",
          };
        }
        return updated;
      });
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop to prevent interaction with page */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />
          <FocusTrap
            active={isOpen && !!trapContainer}
            focusTrapOptions={{
              initialFocus: () =>
                inputRef.current ?? trapContainer ?? undefined,
              fallbackFocus: () => trapContainer ?? document.body,
              allowOutsideClick: true,
              escapeDeactivates: false,
              returnFocusOnDeactivate: false,
            }}
          >
            <motion.div
              ref={setTrapContainer}
              role="dialog"
              aria-modal="true"
              aria-labelledby="chatbot-title"
              tabIndex={-1}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-4 left-0 right-0 mx-auto md:left-auto md:right-8 md:bottom-4 md:mx-0 w-[85vw] max-w-sm md:w-[400px] md:max-w-none h-[65dvh] md:h-[600px] md:max-h-[80vh] min-h-[400px] bg-[#050505]/95 backdrop-blur-xl rounded-[1.5rem] flex flex-col shadow-2xl z-50 overflow-hidden border border-white/20 ring-1 ring-white/5"
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
                    <h3
                      id="chatbot-title"
                      className="font-bold text-white text-sm"
                    >
                      {firstName}&apos;s AI Agent
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={() => setMessages([])}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Clear conversation"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white/70"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    aria-label="Close assistant"
                  >
                    <X size={18} className="text-white/70" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-thin overscroll-contain touch-pan-y"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
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
                                    router.push("/#contact");
                                  }
                                }, 300);
                              }}
                              className="w-full group relative px-4 py-2.5 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 overflow-hidden transition-all duration-300 text-sm shadow-[0_4px_15px_rgba(138,43,226,0.3)] hover:shadow-[0_8px_25px_rgba(138,43,226,0.5)] active:scale-95"
                            >
                              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                              <SparkleIcon
                                size={16}
                                className="relative z-10"
                              />
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
                    ref={inputRef}
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
        </>
      )}
    </AnimatePresence>
  );
}
