"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Loader2 } from "lucide-react";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { cn } from "@/lib/utils";
import { chatWithGeminiAction } from "@/app/actions";
import { useProfile } from "@/components/profile-provider";
import { DEFAULT_CHAT_SUGGESTIONS } from "@/lib/constants/chat-suggestions";
import ReactMarkdown from "react-markdown";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await chatWithGeminiAction(newMessages);

      if (response.startsWith("RATE_LIMIT_EXCEEDED:")) {
        const errorMsg = response.replace("RATE_LIMIT_EXCEEDED:", "").trim();
        setMessages([
          ...newMessages,
          { role: "model", parts: `⚠️ **System Alert:** ${errorMsg}` },
        ]);
      } else {
        setMessages([...newMessages, { role: "model", parts: response }]);
      }
    } catch {
      setSendError("Unable to reach the assistant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 left-0 right-0 mx-auto md:left-auto md:right-8 md:bottom-4 md:mx-0 w-[85vw] md:w-[400px] h-[65vh] md:h-[600px] md:max-h-[80vh] bg-[#050505]/95 backdrop-blur-xl rounded-[1.5rem] flex flex-col shadow-2xl z-50 overflow-hidden border border-white/20 ring-1 ring-white/5"
        >
          {/* Header */}
          <div className="p-4 bg-white/5 backdrop-blur-md flex justify-between items-center border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <SparkleIcon size={18} className="text-primary animate-pulse" />
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
                    Ask me anything about his technical projects, ML skills, or
                    work background.
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
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
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
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
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
              <p className="mb-3 text-xs text-red-300 text-center">{sendError}</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-black/40 border border-white/20 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-full px-4 py-2 text-sm text-white focus:outline-none placeholder:text-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-[#7b2cbf] hover:shadow-[0_0_15px_rgba(138,43,226,0.5)] flex items-center justify-center text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
      )}
    </AnimatePresence>
  );
}
