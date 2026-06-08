"use client";

import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { useChat } from "@/components/chat-provider";

interface AIAgentButtonProps {
  projectTitle: string;
  variant?: "default" | "compact";
}

export function AIAgentButton({
  projectTitle,
  variant = "default",
}: AIAgentButtonProps) {
  const { openChat } = useChat();

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={() => openChat({ projectTitle })}
        className="px-6 py-3 rounded-full bg-primary text-white font-bold flex items-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,43,226,0.35)]"
      >
        <SparkleIcon size={18} />
        <span>Ask AI</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openChat({ projectTitle })}
      className="w-full sm:w-auto sm:min-w-[200px] px-8 py-4 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,43,226,0.35)] hover:shadow-[0_0_30px_rgba(138,43,226,0.55)]"
    >
      <SparkleIcon size={18} />
      <span>Ask AI Agent</span>
    </button>
  );
}
