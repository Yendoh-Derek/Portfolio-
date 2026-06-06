import fs from "fs";
import path from "path";

const docsDir = path.join(process.cwd(), "lib", "project-docs");

export function getProjectDoc(slug: string): string | null {
    const filePath = path.join(docsDir, `${slug}.md`);
    try {
        return fs.readFileSync(filePath, "utf-8");
    } catch {
        return null;
    }
}

export function getAllProjectSlugs(): string[] {
    try {
        return fs
            .readdirSync(docsDir)
            .filter((f) => f.endsWith(".md"))
            .map((f) => f.replace(".md", ""));
    } catch {
        return [];
    }
}
