import fs from "fs/promises";
import path from "path";
import {
  defaultPortfolioData,
  type PortfolioData,
} from "@/lib/portfolio-types";

const STORE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "portfolio-store.json"
);

const AUTH_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "admin-auth.json"
);

export async function readPortfolioStore(): Promise<PortfolioData> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    return {
      ...defaultPortfolioData,
      ...parsed,
      about: {
        ...defaultPortfolioData.about,
        ...(parsed.about ?? {}),
      },
      socials: {
        ...defaultPortfolioData.socials,
        ...(parsed.socials ?? {}),
      },
      seo: {
        ...defaultPortfolioData.seo,
        ...(parsed.seo ?? {}),
      },
      visibility: {
        ...defaultPortfolioData.visibility,
        ...(parsed.visibility ?? {}),
      },
      messages: parsed.messages ?? defaultPortfolioData.messages,
    };
  } catch {
    await writePortfolioStore(defaultPortfolioData);
    return defaultPortfolioData;
  }
}

export async function writePortfolioStore(
  data: PortfolioData
): Promise<PortfolioData> {
  try {
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write to disk store (read-only filesystem):", err);
  }
  return data;
}

export async function getAdminPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) {
    return process.env.ADMIN_PASSWORD;
  }
  try {
    const raw = await fs.readFile(AUTH_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { password?: string };
    if (parsed.password) return parsed.password;
  } catch {
    // Fallback default password
  }
  return "admin123";
}

export async function setAdminPassword(newPassword: string): Promise<void> {
  await fs.mkdir(path.dirname(AUTH_PATH), { recursive: true });
  await fs.writeFile(
    AUTH_PATH,
    JSON.stringify({ password: newPassword }, null, 2),
    "utf-8"
  );
}

export async function verifyAdminRequest(request: Request): Promise<boolean> {
  const headerPassword = request.headers.get("x-admin-password") ?? "";
  const actualPassword = await getAdminPassword();
  return headerPassword === actualPassword;
}

