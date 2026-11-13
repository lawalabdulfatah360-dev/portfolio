import type { Metadata } from "next";
import { Projects } from "@/components/sections/Projects";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const { projects } = await getContent();
  return <Projects projects={projects} />;
}

