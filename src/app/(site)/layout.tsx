import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FrontendAdminBar } from "@/components/admin/FrontendAdminBar";
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { about, socials } = await getContent();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navbar name={about.name} cvUrl={about.cvUrl} socials={socials} />
      <main id="main-content" className="min-h-[calc(100vh-8rem)]">
        {children}
      </main>
      <Footer name={about.name} socials={socials} />
      <FrontendAdminBar />
    </>
  );
}
