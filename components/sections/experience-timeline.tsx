import type { Experience } from "@/lib/content";
import { motion, useScroll, useTransform } from "framer-motion";
import { Briefcase, MapPin } from "lucide-react";
import { useRef } from "react";
import Image from "next/image";

interface ExperienceTimelineProps {
  experience: Experience[];
}

export function ExperienceTimeline({ experience }: ExperienceTimelineProps) {
  const timelineItems = experience.filter(
    (item) => !item.type || item.type === "Experience",
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative py-16 md:py-24 container mx-auto px-4 overflow-hidden"
    >
      {/* Background Interactivity - Parallax Blobs */}
      <motion.div
        style={{ y }}
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -z-10"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -z-10"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          My Journey
        </h2>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full" />
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-24">
        {timelineItems.length === 0 ? (
          <p className="text-center text-white/50 py-12">
            Experience details are being updated.
          </p>
        ) : (
          timelineItems.map((exp, index) => (
            <TimelineCard
              key={exp.id || index}
              exp={exp}
              index={index}
              total={timelineItems.length}
            />
          ))
        )}
      </div>
    </section>
  );
}

function TimelineCard({
  exp,
  index,
  total,
}: {
  exp: Experience;
  index: number;
  total: number;
}) {
  // Determine the timeline marker based on period
  const getTimelineMarker = () => {
    if (exp.period.toLowerCase().includes("present")) return "●";
    if (exp.period.toLowerCase().includes("ongoing")) return "◆";
    // Extract year if available
    const yearMatch = exp.period.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : `${String(index + 1).padStart(2, "0")}`;
  };

  const timelineMarker = getTimelineMarker();
  const isBulletFormat =
    Array.isArray(exp.description) &&
    exp.description.length > 0 &&
    exp.description[0]?.startsWith("•");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="group relative"
    >
      {/* Connecting Line - Enhanced */}
      {index !== total - 1 && (
        <div className="absolute left-[3.5rem] top-20 bottom-[-6rem] w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent hidden md:block group-last:hidden" />
      )}

      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        {/* Timeline Column - Premium Anchor */}
        <div className="md:w-40 flex-shrink-0 flex flex-col items-start md:text-right md:items-end pt-2">
          {/* Timeline Marker */}
          <div className="flex items-center gap-3 mb-4 w-full md:flex-row-reverse md:gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/60 flex items-center justify-center text-accent text-lg font-bold shadow-[0_0_12px_rgba(138,43,226,0.4)]">
              {timelineMarker}
            </div>
            <div className="hidden md:block h-0.5 flex-1 bg-gradient-to-r from-primary/40 to-transparent"></div>
          </div>

          {/* Period & Location */}
          <div className="text-lg font-bold text-white mb-2">{exp.period}</div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground md:flex-row-reverse md:gap-2">
            <MapPin size={14} />
            <span>{exp.location}</span>
          </div>
        </div>

        {/* Content Card - Refined & Glowing */}
        <div className="flex-1 max-w-lg">
          {/* Ambient Glow */}
          <div className="absolute -inset-8 bg-primary/10 rounded-[2.5rem] blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

          <div className="obsidian-card p-6 md:p-8 group-hover:-translate-y-2 transition-transform duration-500">
            {/* Obsidian Effects */}
            <div className="obsidian-highlight group-hover:opacity-100" />
            <div className="obsidian-border group-hover:ring-primary/30" />

            <div className="relative z-30">
              {/* Header with Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:border-primary/40 transition-colors duration-300 flex-shrink-0 overflow-hidden">
                  {exp.logo ? (
                    <Image
                      src={exp.logo}
                      alt={`${exp.company} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Briefcase size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors duration-300">
                    {exp.role}
                  </h3>
                  <p className="text-lg text-white/85 font-medium">
                    {exp.company}
                  </p>
                </div>
              </div>

              {/* Description - Bullet Points or Paragraphs */}
              {exp.description && exp.description.length > 0 ? (
                <div className="space-y-3 text-sm md:text-base text-gray-200 leading-relaxed break-words">
                  {isBulletFormat
                    ? exp.description.map((item, i) => (
                        <p key={i} className="flex gap-3">
                          <span className="text-accent flex-shrink-0 mt-0.5">
                            •
                          </span>
                          <span>{item.replace(/^•\s*/, "")}</span>
                        </p>
                      ))
                    : exp.description.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                </div>
              ) : null}

              {/* Skills if available */}
              {exp.skills && exp.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {exp.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-block px-3 py-1 text-xs bg-primary/15 border border-primary/30 rounded-full text-primary/90 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
