/**
 * Storage layer (server-only).
 *
 * 1. When BLOB_READ_WRITE_TOKEN is set: uses Vercel Blob (permanent cloud storage).
 * 2. Local development / local server: uses ./.local-storage on disk.
 * 3. Serverless without BLOB_READ_WRITE_TOKEN: uses os.tmpdir() + inline data URLs
 *    for images so uploads and edits never crash with EROFS on read-only disks.
 */
import fs from "fs/promises";
import os from "os";
import path from "path";
import { put, list, del } from "@vercel/blob";

export type DocKey = "content" | "messages" | "auth";

const BLOB_PREFIX: Record<DocKey, string> = {
  content: "cms/content",
  messages: "cms/private/messages",
  auth: "cms/private/auth",
};

function getLocalDir(): string {
  if (process.env.VERCEL === "1") {
    return path.join(os.tmpdir(), "portfolio-cms-storage");
  }
  return path.join(process.cwd(), ".local-storage");
}

export function storageMode(): "blob" | "local" {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

async function listDocBlobs(key: DocKey) {
  const prefix = `${BLOB_PREFIX[key]}-`;
  const { blobs } = await list({ prefix });
  return blobs.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export async function readJson<T>(key: DocKey): Promise<T | null> {
  if (storageMode() === "blob") {
    try {
      const blobs = await listDocBlobs(key);
      const latest = blobs[0];
      if (!latest) return null;
      const res = await fetch(latest.url, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  try {
    const dir = getLocalDir();
    const raw = await fs.readFile(path.join(dir, `${key}.json`), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJson<T>(key: DocKey, data: T): Promise<void> {
  const body = JSON.stringify(data, null, 2);

  if (storageMode() === "blob") {
    const created = await put(`${BLOB_PREFIX[key]}.json`, body, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
    const old = (await listDocBlobs(key)).filter((b) => b.url !== created.url);
    if (old.length > 0) {
      await del(old.map((b) => b.url));
    }
    return;
  }

  const dir = getLocalDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${key}.json`), body, "utf-8");
}

function safeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "file";
}

export interface UploadResult {
  url: string;
  downloadUrl: string;
}

export async function saveUpload(
  file: File,
  folder: string
): Promise<UploadResult> {
  const name = safeFileName(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (storageMode() === "blob") {
    const blob = await put(`uploads/${folder}/${name}`, buffer, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });
    return { url: blob.url, downloadUrl: blob.downloadUrl };
  }

  // On Vercel without Blob configured yet, inline as a base64 Data URI so
  // images/files work across serverless invocations without 404s.
  if (process.env.VERCEL === "1") {
    const mime = file.type || "application/octet-stream";
    const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    return { url: dataUrl, downloadUrl: dataUrl };
  }

  const uploadsDir = path.join(getLocalDir(), "uploads");
  const stored = `${Date.now()}-${name}`;
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, stored), buffer);
  const url = `/api/local-media/${stored}`;
  return { url, downloadUrl: url };
}

export async function readLocalUpload(name: string): Promise<Buffer | null> {
  const safe = path.basename(name);
  try {
    const uploadsDir = path.join(getLocalDir(), "uploads");
    return await fs.readFile(path.join(uploadsDir, safe));
  } catch {
    return null;
  }
}
