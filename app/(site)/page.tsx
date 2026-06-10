import { Suspense } from "react";
import { HomeClient } from "@/components/sections/home-client";
import { getProjects, getSkills, getExperience } from "@/lib/content";

export default async function Home() {
  const [projects, skills, experience] = await Promise.all([
    getProjects(),
    getSkills(),
    getExperience(),
  ]);

  return (
    <Suspense fallback={null}>
      <HomeClient projects={projects} skills={skills} experience={experience} />
    </Suspense>
  );
}
