import fs from "fs/promises";
import path from "path";

const docsDir = path.join(process.cwd(), "lib", "project-docs");

export async function getProjectDoc(slug: string): Promise<string | null> {
  const filePath = path.join(docsDir, `${slug}.md`);
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(docsDir);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""));
  } catch {
    return [];
  }
}
