"use client";

import { memo, useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ExternalLink, Github, ArrowRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SparkleIcon } from "@/components/ui/sparkle-icon";

interface ProjectProps {
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  links: { demo?: string; github?: string };
  imageUrl?: string;
  slug?: string;
  isPrivate?: boolean;
}

function ProjectCardComponent({
  project,
  onAskAI,
  index = 0,
}: {
  project: ProjectProps;
  onAskAI: (project: string) => void;
  index?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(0, { stiffness: 100, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 100, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    if (prefersReducedMotionRef.current) return;
    if (!containerRef.current) return;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const rotateXValue = ((clientY - centerY) / height) * 20;
    const rotateYValue = ((clientX - centerX) / width) * -20;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        rotateX.set(0);
        rotateY.set(0);
      }}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className="group relative rounded-[2rem] bg-[#050505] border border-white/5 overflow-hidden shadow-2xl hover:shadow-[0_0_50px_rgba(138,43,226,0.15)] transition-shadow duration-500 flex flex-col"
    >
      {/* Obsidian Reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />

      {/* Inner Glow Border */}
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/20 group-hover:ring-primary/40 transition-all duration-500 z-20 pointer-events-none" />

      {/* Cover Image */}
      {project.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden border-b border-white/5 flex-shrink-0">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            loading={index === 0 ? "eager" : "lazy"}
            className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
      )}

      <div className="relative flex-1 p-8 flex flex-col z-30">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-[#0d0720]/80 text-[#d4cce0] border border-[#8a2be2]/25 hover:border-primary/50 transition-all duration-300 shadow-[0_0_6px_rgba(138,43,226,0.1)] hover:shadow-[0_0_10px_rgba(138,43,226,0.3)]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all hover:scale-110"
                title="View Code"
              >
                <Github size={20} />
              </a>
            )}
            {project.isPrivate && (
              <span
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white/40 cursor-default"
                title="Private — not open source"
              >
                <Lock size={20} />
              </span>
            )}
            {project.links.demo && (
              <a
                href={project.links.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all hover:scale-110"
                title="Live Demo"
              >
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Description - flex-1 pushes buttons to bottom */}
        <div className="flex-1">
          <p className="text-muted-foreground mb-8 leading-relaxed line-clamp-4">
            {project.description}
          </p>
        </div>

        {/* Action Buttons - always at bottom */}
        <div className="flex gap-3">
          <button
            onClick={() => onAskAI(project.title)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-white/20 hover:border-primary/50 text-white font-medium flex items-center justify-center gap-2 transition-all text-sm"
          >
            <SparkleIcon size={16} className="text-primary" />
            <span>Ask AI</span>
          </button>
          {project.slug ? (
            <Link
              href={`/projects/${project.slug}`}
              prefetch={true}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/20 hover:border-primary/50 text-white font-medium flex items-center justify-center gap-2 transition-all text-sm"
            >
              <span>View Details</span>
              <ArrowRight size={16} className="text-primary" />
            </Link>
          ) : project.links.demo || project.links.github ? (
            <a
              href={project.links.demo || project.links.github || "#"}
              target="_blank"
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/20 hover:border-primary/50 text-white font-medium flex items-center justify-center gap-2 transition-all text-sm"
            >
              <span>View Details</span>
              <ArrowRight size={16} className="text-primary" />
            </a>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
