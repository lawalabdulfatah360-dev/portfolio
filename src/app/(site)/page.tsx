import { Hero } from "@/components/sections/Hero";
import { Explore } from "@/components/sections/Explore";
import { CVDownload } from "@/components/sections/CVDownload";
import { getContent } from "@/lib/content";

export default async function HomePage() {
  const content = await getContent();
  return (
    <>
      <Hero about={content.about} />
      <Explore
        counts={{
          skills: content.skills.reduce((n, g) => n + g.items.length, 0),
          experience: content.experience.length,
          projects: content.projects.length,
          publications: content.publications.length,
        }}
        showPublications={content.visibility.publications}
      />
      <CVDownload cvUrl={content.about.cvUrl} />
    </>
  );
}

