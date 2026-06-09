import type { Skill } from "@/lib/content";
import { motion } from "framer-motion";
import { Code2, Database, Layout, Server, Wrench } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = [
    "All",
    "Frontend",
    "Backend",
    "Database",
    "Tools",
    "AI/ML",
  ];

  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((skill) => skill.category === activeCategory);

  const getIcon = (category: string) => {
    switch (category) {
      case "Frontend":
        return <Layout size={20} />;
      case "Backend":
        return <Server size={20} />;
      case "Database":
        return <Database size={20} />;
      case "AI/ML":
        return <Code2 size={20} />;
      case "Tools":
        return <Wrench size={20} />;
      default:
        return <Code2 size={20} />;
    }
  };

  return (
    <section className="py-16 md:py-20 container mx-auto px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-accent">
          Technology and Tools
        </h2>
        <div className="h-1 w-24 bg-primary mx-auto rounded-full mb-8" />

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 md:p-2 rounded-2xl md:rounded-full bg-white/5 border border-white/10 backdrop-blur-md mx-auto max-w-[95vw] sm:max-w-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_20px_rgba(138,43,226,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
        {filteredSkills.length === 0 ? (
          <p className="col-span-full text-center text-white/50 py-12">
            No skills match this category yet.
          </p>
        ) : (
          filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id || index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03, duration: 0.4 }}
              className="group p-4 md:p-6 rounded-[1.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm relative overflow-hidden"
            >
              {/* Interactive light reflection on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 rounded-xl bg-white/[0.03] border border-white/10 group-hover:border-primary/40 transition-all duration-300 shadow-md w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden relative isolate">
                    {skill.icon ? (
                      <Image
                        src={skill.icon}
                        alt={`${skill.name} logo`}
                        fill
                        sizes="48px"
                        className="object-cover transition-all duration-500 group-hover:scale-110 skill-icon-primary"
                      />
                    ) : (
                      <div className="text-primary group-hover:text-white transition-colors duration-300">
                        {getIcon(skill.category)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
                  </div>
                  <h3 className="font-bold text-white text-sm md:text-lg tracking-tight group-hover:text-primary transition-colors truncate">
                    {skill.name}
                  </h3>
                </div>
                <span className="text-[12px] md:text-xs font-mono text-white/50 bg-white/5 border border-white/10 px-2 md:px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  {skill.experience}
                </span>
              </div>

              <div className="relative z-10 space-y-2.5">
                <div className="flex justify-between text-xs tracking-wider uppercase font-semibold">
                  <span className="text-white/45">Proficiency</span>
                  <span className="text-[#00f0ff] font-mono">
                    {skill.level * 10}%
                  </span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full border border-white/5 overflow-hidden p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level * 10}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: index * 0.02,
                    }}
                    className="h-full bg-gradient-to-r from-primary via-[#9d4edd] to-accent rounded-full shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
