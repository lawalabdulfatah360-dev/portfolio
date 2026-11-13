import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import {
  withDefaults,
  type ContactMessage,
  type PortfolioContent,
} from "@/lib/portfolio-types";
import { readJson, writeJson } from "@/lib/storage";

const CONTENT_TAG = "portfolio-content";

/** Uncached read — used by the admin API. */
export async function getContentFresh(): Promise<PortfolioContent> {
  const stored = await readJson<Partial<PortfolioContent>>("content");
  return withDefaults(stored);
}

/**
 * Cached read for public pages. The cache is purged whenever the admin
 * saves, so visitors see changes immediately without hitting storage on
 * every page view.
 */
export const getContent = unstable_cache(getContentFresh, [CONTENT_TAG], {
  tags: [CONTENT_TAG],
  revalidate: 3600,
});

export async function saveContent(
  content: PortfolioContent
): Promise<PortfolioContent> {
  const clean = withDefaults(content);
  await writeJson("content", clean);
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return clean;
}

export async function getMessages(): Promise<ContactMessage[]> {
  return (await readJson<ContactMessage[]>("messages")) ?? [];
}

export async function saveMessages(messages: ContactMessage[]): Promise<void> {
  await writeJson("messages", messages);
}

