import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getContentFresh,
  getMessages,
  saveContent,
} from "@/lib/content";
import type { PortfolioContent } from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [content, messages] = await Promise.all([
    getContentFresh(),
    getMessages(),
  ]);
  return NextResponse.json(
    { content, messages },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let incoming: PortfolioContent & { messages?: unknown };
  try {
    incoming = (await request.json()) as PortfolioContent & {
      messages?: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Messages are managed separately and never written into public content.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { messages: _ignored, ...content } = incoming;

  try {
    const saved = await saveContent(content);
    return NextResponse.json({ content: saved });
  } catch (err) {
    console.error("Failed to save content:", err);
    return NextResponse.json(
      { error: "Could not save to storage. Check BLOB_READ_WRITE_TOKEN." },
      { status: 500 }
    );
  }
}

