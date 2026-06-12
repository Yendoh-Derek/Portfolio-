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
