"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { Chatbot } from "@/components/chatbot";
import { SparkleIcon } from "@/components/ui/sparkle-icon";
import {
  DEFAULT_CHAT_SUGGESTIONS,
  projectChatSuggestions,
} from "@/lib/constants/chat-suggestions";

interface ChatContextValue {
  isOpen: boolean;
  openChat: (options?: { projectTitle?: string; prefill?: string }) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    ...DEFAULT_CHAT_SUGGESTIONS,
  ]);
  const [prefill, setPrefill] = useState("");
  const searchParams = useSearchParams();

  useEffect(() => {
    const chatMsg = searchParams.get("chat");
    if (chatMsg) {
      setPrefill(decodeURIComponent(chatMsg));
      setSuggestions([...DEFAULT_CHAT_SUGGESTIONS]);
      setIsOpen(true);
    }
  }, [searchParams]);

  const openChat = useCallback(
    (options?: { projectTitle?: string; prefill?: string }) => {
      if (options?.projectTitle) {
        setSuggestions(projectChatSuggestions(options.projectTitle));
      } else {
        setSuggestions([...DEFAULT_CHAT_SUGGESTIONS]);
      }
      setPrefill(options?.prefill ?? "");
      setIsOpen(true);
    },
    [],
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setPrefill("");
  }, []);

  const value = useMemo(
    () => ({ isOpen, openChat, closeChat }),
    [isOpen, openChat, closeChat],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <Chatbot
        isOpen={isOpen}
        onClose={closeChat}
        suggestions={suggestions}
        prefillInput={prefill}
      />
      {!isOpen && (
        <button
          onClick={() => openChat()}
          className="fixed bottom-5 right-4 md:bottom-8 md:right-8 group z-[100]"
          aria-label="Open AI assistant"
        >
          <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-[0_0_20px_rgba(138,43,226,0.4)] md:shadow-[0_0_30px_rgba(138,43,226,0.6)] animate-pulse-slow overflow-hidden">
            <div className="absolute inset-1 rounded-full bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-primary/50 to-transparent rounded-full animate-spin-slow" />
            </div>
            <SparkleIcon
              size={18}
              className="relative z-20 text-white md:size-6 group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent z-20" />
          </div>
        </button>
      )}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return ctx;
}
