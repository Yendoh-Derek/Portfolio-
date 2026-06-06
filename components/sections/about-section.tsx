"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useProfile } from "@/components/profile-provider";

export function AboutSection() {
  const { personal, about } = useProfile();

  if (!about) {
    return null;
  }

  return (
    <section
      id="about"
      className="py-12 md:py-16 lg:py-20 container mx-auto px-4 relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          About
        </h2>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[320px_1fr] gap-8 md:gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center md:items-start gap-6"
        >
          <div className="group relative isolate w-80 h-96 sm:w-72 sm:h-96 md:w-64 md:h-80">
            <div className="avatar-glow-ring" aria-hidden="true" />
            <div className="avatar-container h-full w-full">
              <Image
                src={about.imageUrl}
                alt={personal.name}
                fill
                className="object-cover object-top z-10"
                sizes="(max-width: 640px) 320px, (max-width: 768px) 288px, 256px"
                priority
              />
            </div>
          </div>

          {about.quote && (
            <blockquote className="text-center md:text-left text-sm italic text-muted-foreground border-l-2 border-primary/40 pl-4 max-w-xs">
              &ldquo;{about.quote}&rdquo;
            </blockquote>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-5 text-muted-foreground leading-relaxed"
        >
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
          {about.highlight && (
            <p className="text-white/80">{about.highlight}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
