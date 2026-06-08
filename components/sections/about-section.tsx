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
      className="py-8 md:py-16 lg:py-24 container mx-auto px-4 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-4">
            About
          </h2>
          {about.label && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-primary uppercase mb-10 block"
            >
              {about.label}
            </motion.span>
          )}
          <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-primary/40 to-transparent mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[7fr_13fr] gap-12 md:gap-16 lg:gap-24 items-center">
          {/* Portrait & Quote Column (Left) */}
          <div className="space-y-10 md:space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="group relative isolate w-full aspect-[4/5] max-w-[320px] md:max-w-full mx-auto">
                {/* Animated glow ring behind */}
                <div className="avatar-glow-ring opacity-30 group-hover:opacity-60 transition-opacity duration-700" />

                {/* Main Image Container */}
                <div className="avatar-container h-full w-full bg-zinc-950">
                  <Image
                    src={about.imageUrl}
                    alt={personal.name}
                    fill
                    className="object-cover object-top z-10 filter grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 ease-in-out"
                    sizes="(max-width: 768px) 320px, (max-width: 1024px) 380px, 400px"
                    priority
                  />

                  {/* Vignette & Depth Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20 opacity-40" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 z-30 rounded-[2.5rem]" />
                </div>

                {/* Technical Accents */}
                <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 border-r border-b border-primary/20 rounded-br-[2.5rem] md:rounded-br-[3rem] -z-10 group-hover:border-primary/40 transition-colors duration-500" />
                <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-12 h-12 md:w-16 md:h-16 border-l border-t border-primary/20 rounded-tl-[1.25rem] md:rounded-tl-[1.5rem] -z-10 group-hover:border-primary/40 transition-colors duration-500" />
              </div>
            </motion.div>

            {/* Philosophy Highlight - Aligned with image width */}
            {about.quote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative max-w-[320px] md:max-w-full mx-auto text-center px-4 md:px-0"
              >
                <p className="text-lg md:text-xl lg:text-2xl font-medium leading-snug text-white/90 tracking-tight italic">
                  &ldquo;{about.quote}&rdquo;
                </p>
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto mt-4" />
              </motion.div>
            )}
          </div>

          {/* Main Narrative Column (Right) */}
          <div className="space-y-12 md:pl-8 lg:pl-16 mx-auto md:mx-0">
            {/* Content Blocks */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-[580px] space-y-10 md:space-y-12 text-left"
            >
              {about.sections.map((section) => (
                <div key={section.title} className="group">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-primary/60 uppercase mb-4 group-hover:text-primary transition-colors duration-300">
                    {section.title}
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-light">
                    {section.content}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
