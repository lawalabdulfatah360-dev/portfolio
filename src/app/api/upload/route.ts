import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { verifyAdminRequest } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid admin password." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = (formData.get("category") as string | null) ?? "project";

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No valid file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const safeOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-");
    const ext = path.extname(safeOriginalName) || ".png";
    const baseName = path.basename(safeOriginalName, ext);
    const timestamp = Date.now();

    let relativePath = "";
    let extraCopyPath = "";

    if (category === "profile") {
      relativePath = `/images/profile-${timestamp}${ext}`;
      extraCopyPath = `/images/profile.jpg`;
    } else if (category === "cv") {
      relativePath = `/documents/cv.pdf`;
    } else if (category === "og") {
      relativePath = `/images/og-${timestamp}${ext}`;
      extraCopyPath = `/images/og-image.png`;
    } else {
      relativePath = `/images/projects/${baseName}-${timestamp}${ext}`;
    }

    try {
      const fullPath = path.join(process.cwd(), "public", relativePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, buffer);

      if (extraCopyPath) {
        const extraFull = path.join(process.cwd(), "public", extraCopyPath);
        await fs.mkdir(path.dirname(extraFull), { recursive: true });
        await fs.writeFile(extraFull, buffer);
      }

      const publicUrl =
        category === "cv" ? `/documents/cv.pdf?v=${timestamp}` : relativePath;

      return NextResponse.json({
        url: publicUrl,
        name: file.name,
        size: file.size,
      });
    } catch {
      // Fallback to base64 Data URI if hosted on a read-only serverless disk
      const mimeType = file.type || "application/octet-stream";
      const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: dataUrl,
        name: file.name,
        size: file.size,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }
}

