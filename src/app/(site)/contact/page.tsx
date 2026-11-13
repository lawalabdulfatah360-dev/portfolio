import type { Metadata } from "next";
import { Contact } from "@/components/sections/Contact";
import { getContent } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { socials } = await getContent();
  return <Contact socials={socials} />;
}

