import { NextResponse } from "next/server";
import {
  checkPassword,
  clearFailedLogins,
  clientIp,
  createSession,
  getCredential,
  isLockedOut,
  recordFailedLogin,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (isLockedOut(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  if (!(await getCredential())) {
    return NextResponse.json(
      {
        error:
          "Admin login is disabled. Set the ADMIN_PASSWORD environment variable in Vercel and redeploy.",
      },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await checkPassword(password))) {
    recordFailedLogin(ip);
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  clearFailedLogins(ip);
  await createSession();
  return NextResponse.json({ ok: true });
}

