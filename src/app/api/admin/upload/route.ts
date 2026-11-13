import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_FOLDERS = new Set(["profile", "project", "cv", "og"]);
const MAX_BYTES = 20 * 1024 * 1024;

/**
 * Server-side upload. Used in local dev, and as a fallback.
 * In production with Vercel Blob, the admin uploads directly from the
 * browser via /api/admin/blob-upload (no 4.5 MB function body limit).
 */
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = formData.get("category");
    const folder =
      typeof folderRaw === "string" && ALLOWED_FOLDERS.has(folderRaw)
        ? folderRaw
        : "project";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is larger than 20 MB." },
        { status: 413 }
      );
    }

    const result = await saveUpload(file, folder);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

