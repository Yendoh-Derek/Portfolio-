import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  loadExperience,
  loadProfile,
  loadProjects,
  loadServices,
  loadSkills,
} from "./loaders";
import type { Experience, PortfolioSnapshot, Project, ServicesContent, Skill } from "./types";

export type {
  AboutContent,
  Experience,
  PortfolioSnapshot,
  Profile,
  Project,
  ProjectDetails,
  ServicesContent,
  Skill,
  SkillCategory,
} from "./types";
export { getProjectDoc, getAllProjectSlugs } from "./docs";
export { getRelatedProjects } from "./related-projects";

const isDev = process.env.NODE_ENV === "development";

function cacheContent<T>(
  key: string,
  tags: string[],
  loader: () => Promise<T>,
): () => Promise<T> {
  const requestCached = cache(loader);
  if (isDev) {
    return requestCached;
  }
  return unstable_cache(requestCached, [key], { tags });
}

export const getProfile = cacheContent(
  "content-profile",
  ["content-profile"],
  loadProfile,
);

export const getProjects = cacheContent(
  "content-projects",
  ["content-projects"],
  loadProjects,
);

export const getSkills = cacheContent(
  "content-skills",
  ["content-skills"],
  loadSkills,
);

export const getExperience = cacheContent(
  "content-experience",
  ["content-experience"],
  loadExperience,
);

export const getServices = cacheContent(
  "content-services",
  ["content-services"],
  loadServices,
);

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}

export const getPortfolioSnapshot = cacheContent(
  "portfolio-snapshot",
  [
    "content-profile",
    "content-projects",
    "content-skills",
    "content-experience",
  ],
  async (): Promise<PortfolioSnapshot> => {
    const [profile, skillsDetail, experience, projects] = await Promise.all([
      getProfile(),
      getSkills(),
      getExperience(),
      getProjects(),
    ]);

    return {
      personal: profile.personal,
      about: profile.about,
      skills: profile.skillsSummary,
      skillsDetail,
      experience,
      projects,
    };
  },
);
