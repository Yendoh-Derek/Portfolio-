import { unstable_cache } from "next/cache";
import { getPortfolioSnapshot } from "@/lib/content";
import { buildSystemPrompt } from "./prompt";
import { loadAllProjectDocs, loadAllDocsAsMap } from "./project-docs";
import type { ChatMessage } from "./validation";
import { selectRelevantDocs } from "./context-selector";

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
    loadAllDocsAsMap(),
  ]);

  const lastUserMessage = messages[messages.length - 1].parts;
  
  const relevantContext = selectRelevantDocs(
    lastUserMessage,
    messages.slice(0, -1),
    allDocs
  );

  return staticPrompt + "\n\n" + relevantContext;
}

// For backward compatibility
const getCachedSystemPrompt = unstable_cache(
  async () => {
    const [staticPrompt, projectDocs] = await Promise.all([
      getStaticPrompt(),
      loadAllProjectDocs(),
    ]);
    return staticPrompt + projectDocs;
  },
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
    const [staticPrompt, projectDocs] = await Promise.all([
      getStaticPrompt(),
      loadAllProjectDocs(),
    ]);
    return staticPrompt + projectDocs;
  }
  return getCachedSystemPrompt();
}
