"use client";

import { SparkleIcon } from "@/components/ui/sparkle-icon";
import { useChat } from "@/components/chat-provider";

interface ProjectDetailSidebarProps {
  projectTitle: string;
  tech: string[];
}

export function ProjectDetailSidebar({
  projectTitle,
  tech,
}: ProjectDetailSidebarProps) {
  const { openChat } = useChat();

  return (
    <aside className="lg:col-span-4 space-y-8">
      <div className="obsidian-card p-6 md:p-8 space-y-6 sticky top-24 max-w-2xl mx-auto lg:max-w-none">
        <div className="flex items-center gap-3 text-white font-bold border-b border-white/10 pb-4">
          <SparkleIcon size={20} className="text-primary animate-pulse" />
          <h3>AI Assistant</h3>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          Want to know more about the architecture or design decisions of this
          project? Ask my AI agent!
        </p>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => openChat({ projectTitle })}
            className="w-full sm:w-auto sm:min-w-[200px] px-8 py-4 rounded-full bg-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,43,226,0.35)] hover:shadow-[0_0_30px_rgba(138,43,226,0.55)]"
          >
            <SparkleIcon size={18} />
            <span>Ask AI Agent</span>
          </button>
        </div>

        <div className="pt-6 space-y-4 border-t border-white/10">
          {tech.slice(0, 4).map((t) => (
            <div key={t} className="flex items-center gap-3 text-xs text-white/60">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
              <span>Focus: {t}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
