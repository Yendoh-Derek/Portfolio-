"use client";

import { Zap } from "lucide-react";
import { useChat } from "@/components/chat-provider";

interface MobileAICTAProps {
  projectTitle: string;
}

export function MobileAICTA({ projectTitle }: MobileAICTAProps) {
  const { openChat } = useChat();

  return (
    <button
      type="button"
      onClick={() => openChat({ projectTitle })}
      className="w-full py-3 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,43,226,0.35)]"
    >
      <Zap size={18} />
      <span>Ask AI About This</span>
    </button>
  );
}
