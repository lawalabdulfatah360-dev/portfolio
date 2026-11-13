import type { Metadata } from "next";
import { About } from "@/components/sections/About";
import { Background } from "@/components/sections/Background";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const c = await getContent();
  return (
    <>
      <About about={c.about} />
      <Background
        education={c.education}
        certifications={c.certifications}
        memberships={c.memberships}
        referees={c.referees}
        visibility={c.visibility}
      />
    </>
  );
}

