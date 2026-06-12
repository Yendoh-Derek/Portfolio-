import { unstable_cache } from "next/cache";
import { getPortfolioSnapshot } from "@/lib/content";
import { buildSystemPrompt } from "./prompt";
import { loadAllProjectDocs } from "./project-docs";
import type { ChatMessage } from "./validation";

const isDev = process.env.NODE_ENV === "development";

async function buildStaticPrompt(): Promise<string> {
  const snapshot = await getPortfolioSnapshot();
  return buildSystemPrompt(snapshot);
}

const getCachedStaticPrompt = unstable_cache(
  buildStaticPrompt,
  ["ai-static-prompt"],
  {
    tags: [
      "ai-static-prompt",
      "content-profile",
      "content-projects",
      "content-skills",
      "content-experience",
    ],
    revalidate: 3600,
  },
);

const getCachedAllDocs = unstable_cache(
  loadAllProjectDocs,
  ["project-docs-all"],
  {
    tags: ["project-docs"],
    revalidate: 3600,
  },
);

export async function getStaticPrompt(): Promise<string> {
  if (isDev) {
    return buildStaticPrompt();
  }
  return getCachedStaticPrompt();
}

export async function buildRequestPrompt(
  messages: ChatMessage[]
): Promise<string> {
  const [staticPrompt, allDocs] = await Promise.all([
    getStaticPrompt(),
    getCachedAllDocs(),
  ]);

  return staticPrompt + "\n\n" + allDocs;
}


