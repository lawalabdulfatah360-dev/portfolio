import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { saveContent } from "@/lib/content";
import { defaultContent } from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const saved = await saveContent(defaultContent);
  return NextResponse.json({ content: saved });
}

