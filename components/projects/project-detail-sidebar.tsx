"use client";

import { AIAgentButton } from "@/components/projects/ai-agent-button";

interface ProjectDetailSidebarProps {
  projectTitle: string;
  tech: string[];
}

export function ProjectDetailSidebar({
  projectTitle,
  tech,
}: ProjectDetailSidebarProps) {
  return (
    <aside className="hidden lg:block lg:col-span-4 space-y-8">
      <div className="obsidian-card p-8 space-y-6 sticky top-24">
        <div className="flex items-center gap-3 text-white font-bold border-b border-white/10 pb-4">
          <h3>AI Assistant</h3>
        </div>
        <p className="text-sm text-white/50 leading-relaxed">
          Want to know more about the architecture or design decisions of this
          project? Ask my AI agent!
        </p>
        <div className="flex justify-center">
          <AIAgentButton projectTitle={projectTitle} />
        </div>

        <div className="pt-6 space-y-4 border-t border-white/10">
          {tech.slice(0, 4).map((t) => (
            <div
              key={t}
              className="flex items-center gap-3 text-xs text-white/60"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(0,240,255,0.8)]" />
              <span>Focus: {t}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
