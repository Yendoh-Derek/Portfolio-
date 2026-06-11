import fs from "fs/promises";
import path from "path";

const docsDir = path.join(process.cwd(), "lib", "project-docs");

export async function loadAllProjectDocs(): Promise<string> {
  try {
    const files = await fs.readdir(docsDir);
    let docsContent = "\n\nDETAILED PROJECT DOCUMENTATION:\n";

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const content = await fs.readFile(path.join(docsDir, file), "utf-8");
      docsContent += `\n--- PROJECT: ${file.replace(".md", "").toUpperCase()} ---\n${content}\n`;
    }

    return docsContent;
  } catch (e) {
    console.error("Error reading project docs:", e);
    return "";
  }
}

export async function loadAllDocsAsMap(): Promise<Record<string, string>> {
  try {
    const files = await fs.readdir(docsDir);
    const docs: Record<string, string> = {};

    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const key = file.replace(".md", "");
      const content = await fs.readFile(path.join(docsDir, file), "utf-8");
      docs[key] = content;
    }

    return docs;
  } catch (e) {
    console.error("Error reading project docs map:", e);
    return {};
  }
}
