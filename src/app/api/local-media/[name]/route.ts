import { NextResponse } from "next/server";
import path from "path";
import { readLocalUpload, storageMode } from "@/lib/storage";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

/** Serves files uploaded in local-dev mode (no Vercel Blob token). */
export async function GET(
  _request: Request,
  { params }: { params: { name: string } }
) {
  if (storageMode() !== "local") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const file = await readLocalUpload(params.name);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const type =
    TYPES[path.extname(params.name).toLowerCase()] ?? "application/octet-stream";
  return new NextResponse(new Uint8Array(file), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600" },
  });
}

