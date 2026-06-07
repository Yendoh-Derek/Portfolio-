import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/content/types";

export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-8 pt-8 border-t border-white/10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Related Projects
        </h2>
        <p className="text-white/50 mt-2 text-sm md:text-base">
          Projects with overlapping themes or shared technical foundations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group obsidian-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(138,43,226,0.12)]"
          >
            {project.imageUrl && (
              <div className="relative h-36 w-full overflow-hidden border-b border-white/5 bg-[#0a0a0a]">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-3 opacity-70 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-500"
                />
              </div>
            )}
            <div className="p-5 space-y-3">
              <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed line-clamp-2">
                {project.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/80 group-hover:text-primary transition-colors">
                View project
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
