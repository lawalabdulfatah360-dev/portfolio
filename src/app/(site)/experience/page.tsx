import type { Metadata } from "next";
import { Experience } from "@/components/sections/Experience";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Experience" };

export default async function ExperiencePage() {
  const { experience } = await getContent();
  return <Experience experience={experience} />;
}

