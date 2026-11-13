import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Publications } from "@/components/sections/Publications";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Publications" };

export default async function PublicationsPage() {
  const { publications, visibility } = await getContent();
  if (!visibility.publications) notFound();
  return <Publications publications={publications} />;
}

