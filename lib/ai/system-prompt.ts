import { unstable_cache } from "next/cache";
import { getPortfolioSnapshot } from "@/lib/content";
import { buildSystemPrompt } from "./prompt";
import { loadAllProjectDocs } from "./project-docs";

const isDev = process.env.NODE_ENV === "development";

async function buildFullSystemPrompt(): Promise<string> {
  const [snapshot, projectDocs] = await Promise.all([
    getPortfolioSnapshot(),
    loadAllProjectDocs(),
  ]);

  return buildSystemPrompt(snapshot) + projectDocs;
}

const getCachedSystemPrompt = unstable_cache(
  buildFullSystemPrompt,
  ["ai-system-prompt"],
  {
    tags: [
      "ai-system-prompt",
      "content-profile",
      "content-projects",
      "content-skills",
      "content-experience",
    ],
    revalidate: 3600,
  },
);

export async function getSystemPrompt(): Promise<string> {
  if (isDev) {
    return buildFullSystemPrompt();
  }
  return getCachedSystemPrompt();
}
