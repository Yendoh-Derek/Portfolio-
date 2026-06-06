import type { Project } from "./types";

export function getRelatedProjects(
  current: Project,
  allProjects: Project[],
  limit = 3,
): Project[] {
  const explicit = current.details?.relatedSlugs ?? [];
  const fromExplicit = explicit
    .map((slug) => allProjects.find((p) => p.slug === slug))
    .filter((p): p is Project => p != null && p.slug !== current.slug);

  if (fromExplicit.length >= limit) {
    return fromExplicit.slice(0, limit);
  }

  const currentTech = new Set(current.tech);
  const scored = allProjects
    .filter((p) => p.slug !== current.slug && !explicit.includes(p.slug))
    .map((p) => ({
      project: p,
      score: p.tech.filter((t) => currentTech.has(t)).length,
    }))
    .sort((a, b) => b.score - a.score);

  const combined = [...fromExplicit];
  for (const { project } of scored) {
    if (combined.length >= limit) break;
    combined.push(project);
  }

  return combined.slice(0, limit);
}
