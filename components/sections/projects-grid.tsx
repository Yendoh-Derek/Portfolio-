import type { Project } from "@/lib/content";
import { ProjectCard } from "./project-card";
import { motion } from "framer-motion";

interface ProjectsGridProps {
  projects: Project[];
  onAskAI: (context: string) => void;
}

const OPEN_SOURCE_SLUGS = new Set([
  "cascade",
  "prompt-engineering-framework",
  "recommendation-system",
  "diatrack",
  "cardiometabolic-risk-from-wearables",
]);

export function ProjectsGrid({ projects, onAskAI }: ProjectsGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <section id="projects" className="py-16 px-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Selected Projects
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          HealthTech, EdTech, and applied ML. From voice agents to clinical
          decision support. Ask my AI assistant about the technical details of
          any project.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {projects.length === 0 ? (
          <p className="col-span-full text-center text-white/50 py-12">
            Projects are being updated. Check back soon.
          </p>
        ) : (
          projects.map((project, index) => (
            <ProjectCard
              key={project.id || index}
              project={{
                title: project.title,
                subtitle: project.tech[0] || "Project",
                tech: project.tech,
                description: project.description,
                links: {
                  demo: project.projectUrl,
                  github: OPEN_SOURCE_SLUGS.has(project.slug)
                    ? project.githubUrl
                    : undefined,
                },
                imageUrl: project.imageUrl,
                slug: project.slug,
                isPrivate: project.slug === "edge-ai",
              }}
              onAskAI={(title) =>
                onAskAI(
                  `Tell me about the technical approach for the ${title} project.`,
                )
              }
              index={index}
            />
          ))
        )}
      </motion.div>
    </section>
  );
}
