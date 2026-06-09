import { Suspense } from "react";
import { HomeClient } from "@/components/sections/home-client";
import { getProjects, getSkills } from "@/lib/content";

export default async function Home() {
  const [projects, skills] = await Promise.all([getProjects(), getSkills()]);

  return (
    <Suspense fallback={null}>
      <HomeClient projects={projects} skills={skills} />
    </Suspense>
  );
}
