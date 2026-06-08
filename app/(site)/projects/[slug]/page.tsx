import { getProjectBySlug, getProjects } from "@/lib/content";
import { getRelatedProjects } from "@/lib/content/related-projects";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Lightbulb,
  Target,
  Sparkles,
  Layers,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProjectDetailSidebar } from "@/components/projects/project-detail-sidebar";
import { AIAgentButton } from "@/components/projects/ai-agent-button";
import { ProjectFeatureIcon } from "@/components/projects/project-feature-icon";
import { RelatedProjects } from "@/components/projects/related-projects";
import { SectionHeading } from "@/components/projects/section-heading";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return {};

  const url =
    process.env.NEXT_PUBLIC_APP_URL || "https://ai-portfolio.vercel.app";

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: "article",
      url: `${url}/projects/${project.slug}`,
      images: [
        {
          url: project.imageUrl,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description,
      images: [project.imageUrl],
    },
    alternates: {
      canonical: `${url}/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const [project, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
  ]);

  if (!project?.details) {
    notFound();
  }

  const details = project.details;
  const related = getRelatedProjects(project, allProjects);

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-20 selection:bg-primary/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a0b2e_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-all mb-10 group py-2 px-4 rounded-full bg-white/5 border border-white/10 hover:border-primary/50"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-sm font-medium">Back to Projects</span>
        </Link>

        {/* Hero */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-16 lg:mb-24 items-stretch">
          <div className="lg:col-span-7 space-y-5">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
              {project.title}
            </h1>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2 justify-center lg:justify-start">
              {/* Mobile AI Agent Button - shown first on mobile, except for diatrack */}
              {slug !== "diatrack" && (
                <div className="lg:hidden">
                  <AIAgentButton
                    projectTitle={project.title}
                    variant="compact"
                  />
                </div>
              )}
              {project.projectUrl && (
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-primary text-white font-bold flex items-center gap-2 hover:opacity-95 transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(138,43,226,0.4)]"
                >
                  <ExternalLink size={18} />
                  View Live
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-white/[0.04] border border-white/15 text-white font-bold flex items-center gap-2 hover:bg-white/[0.06] transition-all hover:scale-[1.02]"
                >
                  <Github size={18} />
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative w-full min-h-[260px] lg:min-h-[300px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] flex items-center justify-center p-5">
              <Image
                src={project.imageUrl}
                alt={project.title}
                width={640}
                height={480}
                className="w-full h-auto max-h-[380px] object-contain"
                priority
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 blur-3xl rounded-full -z-10" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 blur-3xl rounded-full -z-10" />
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-16 md:space-y-20">
            {/* Problem & Solution */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="obsidian-card p-7 md:p-8 space-y-4 border-l-2 border-l-primary/50">
                <SectionHeading icon={Target} title="The Problem" />
                <p className="text-white/70 leading-relaxed text-[15px] md:text-base">
                  {details.problem}
                </p>
              </div>
              <div className="obsidian-card p-7 md:p-8 space-y-4 border-l-2 border-l-accent/50">
                <SectionHeading icon={Sparkles} title="The Solution" />
                <p className="text-white/70 leading-relaxed text-[15px] md:text-base">
                  {details.solution}
                </p>
              </div>
            </section>

            {/* Key Features */}
            <section className="space-y-8">
              <SectionHeading
                icon={Layers}
                title="Key Features"
                subtitle="What makes this project work — at a glance."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="obsidian-card p-6 flex gap-4 group hover:border-primary/25 transition-colors"
                  >
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <ProjectFeatureIcon
                        name={feature.icon}
                        className="text-primary"
                      />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-white/50 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Technical Architecture */}
            <section className="space-y-8">
              <SectionHeading
                icon={Layers}
                title="Technical Architecture"
                subtitle="How the system works end to end."
              />
              <div className="obsidian-card p-7 md:p-9 space-y-8">
                <p className="text-white/70 leading-[1.75] text-[15px] md:text-base">
                  {details.architecture}
                </p>

                <div className="space-y-5 pt-2 border-t border-white/10">
                  {details.techStack.map((group) => (
                    <div key={group.category} className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">
                        {group.category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#0d0720]/80 text-[#d4cce0] border border-[#8a2be2]/25"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Key Technical Decisions */}
            <section className="space-y-8">
              <SectionHeading
                icon={Lightbulb}
                title="Key Technical Decisions"
                subtitle="Engineering choices and the reasoning behind them."
              />
              <div className="space-y-4">
                {details.decisions.map((decision, i) => (
                  <div
                    key={decision.title}
                    className="obsidian-card p-6 md:p-7 flex gap-5"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="space-y-2">
                      <h3 className="font-bold text-white">{decision.title}</h3>
                      <p className="text-sm text-white/55 leading-relaxed">
                        {decision.rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Results / Impact */}
            <section className="space-y-8">
              <SectionHeading icon={TrendingUp} title="Results & Impact" />
              <div className="obsidian-card p-7 md:p-9 space-y-6">
                {details.impact.metrics &&
                  details.impact.metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {details.impact.metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 text-center"
                        >
                          <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                            {metric.value}
                          </div>
                          <div className="text-xs text-white/45 uppercase tracking-wider font-medium">
                            {metric.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                <p className="text-white/65 leading-relaxed text-[15px] md:text-base">
                  {details.impact.summary}
                </p>
              </div>
            </section>

            {details.disclaimer && (
              <div className="flex gap-3 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-200/70 text-sm leading-relaxed">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>{details.disclaimer}</p>
              </div>
            )}

            <RelatedProjects projects={related} />
          </div>

          <ProjectDetailSidebar
            projectTitle={project.title}
            tech={project.tech}
          />
        </div>
      </div>
    </main>
  );
}
