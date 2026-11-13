import type { Metadata } from "next";
import { Skills } from "@/components/sections/Skills";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Skills" };

export default async function SkillsPage() {
  const { skills } = await getContent();
  return <Skills skills={skills} />;
}

