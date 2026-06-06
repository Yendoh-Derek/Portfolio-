import fs from "fs/promises";
import path from "path";
import type { Experience, Profile, Project, ServicesContent, Skill } from "./types";

const contentDir = path.join(process.cwd(), "content");

async function readJsonFile<T>(filename: string): Promise<T> {
    const filePath = path.join(contentDir, filename);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
}

export async function loadProfile(): Promise<Profile> {
    return readJsonFile<Profile>("profile.json");
}

export async function loadSkills(): Promise<Skill[]> {
    const skills = await readJsonFile<Skill[]>("skills.json");
    return [...skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function loadExperience(): Promise<Experience[]> {
    const experience = await readJsonFile<Experience[]>("experience.json");
    return [...experience].sort((a, b) => a.order - b.order);
}

export async function loadProjects(): Promise<Project[]> {
    const projects = await readJsonFile<Project[]>("projects.json");
    return [...projects]
        .sort((a, b) => a.order - b.order)
        .map((project) => ({
            ...project,
            id: project.slug,
        }));
}

export async function loadServices(): Promise<ServicesContent> {
    return readJsonFile<ServicesContent>("services.json");
}
