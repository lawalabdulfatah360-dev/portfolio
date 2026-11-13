/**
 * Storage layer (server-only).
 *
 * - Production / any env with BLOB_READ_WRITE_TOKEN: Vercel Blob.
 * - Local dev without a token: files in ./.local-storage (git-ignored).
 *
 * JSON documents are written with a random suffix on every save and the
 * previous versions are deleted. Each version therefore has a unique,
 * unguessable URL, so readers never get a stale CDN copy and private
 * documents (password hash, inbox) can't be found without the token.
 */
import fs from "fs/promises";
import path from "path";
import { put, list, del } from "@vercel/blob";

export type DocKey = "content" | "messages" | "auth";

const BLOB_PREFIX: Record<DocKey, string> = {
  content: "cms/content",
  messages: "cms/private/messages",
  auth: "cms/private/auth",
};

const LOCAL_DIR = path.join(process.cwd(), ".local-storage");
const LOCAL_UPLOADS = path.join(LOCAL_DIR, "uploads");

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
    const blobs = await listDocBlobs(key);
    const latest = blobs[0];
    if (!latest) return null;
    // URL is unique per version, so it is safe to cache.
    const res = await fetch(latest.url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  }

  try {
    const raw = await fs.readFile(path.join(LOCAL_DIR, `${key}.json`), "utf-8");
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

  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, `${key}.json`), body, "utf-8");
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

/** Server-side upload (used in local mode, and for small files in blob mode). */
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

  const stored = `${Date.now()}-${name}`;
  await fs.mkdir(LOCAL_UPLOADS, { recursive: true });
  await fs.writeFile(path.join(LOCAL_UPLOADS, stored), buffer);
  const url = `/api/local-media/${stored}`;
  return { url, downloadUrl: url };
}

export async function readLocalUpload(
  name: string
): Promise<Buffer | null> {
  // basename() prevents path traversal
  const safe = path.basename(name);
  try {
    return await fs.readFile(path.join(LOCAL_UPLOADS, safe));
  } catch {
    return null;
  }
}

