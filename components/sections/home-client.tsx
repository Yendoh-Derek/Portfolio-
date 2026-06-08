"use client";

import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about-section";
import { ProjectsGrid } from "@/components/sections/projects-grid";
import { SkillsSection } from "@/components/sections/skills-section";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { ContactSection } from "@/components/sections/contact";
import { useEffect } from "react";
import type { Experience, Project, Skill } from "@/lib/content";
import { ServicesTeaser } from "@/components/sections/services-teaser";
import { useChat } from "@/components/chat-provider";
import { ScrollReveal } from "@/components/layout/scroll-reveal";

interface HomeClientProps {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
}

export function HomeClient({ projects, skills, experience }: HomeClientProps) {
  const { openChat } = useChat();

  useEffect(() => {
    const key = `visit-tracked-${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(key)) return;

    fetch("/api/analytics/visit", { method: "POST" })
      .then(() => sessionStorage.setItem(key, "1"))
      .catch(() => {
        // Ignore analytics failures.
      });
  }, []);

  const handleAskAI = (projectTitle: string) => {
    openChat({ projectTitle });
  };

  return (
    <div className="min-h-screen text-foreground selection:bg-primary selection:text-white pb-32 overflow-x-hidden relative">
      <Hero onOpenChat={() => openChat()} />

      <ScrollReveal delay={0.1}>
        <AboutSection />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <ProjectsGrid projects={projects} onAskAI={handleAskAI} />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <ServicesTeaser />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <ExperienceTimeline experience={experience} />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <SkillsSection skills={skills} />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <ContactSection />
      </ScrollReveal>
    </div>
  );
}
