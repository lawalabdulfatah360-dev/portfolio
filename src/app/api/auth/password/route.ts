import { NextResponse } from "next/server";
import {
  MIN_PASSWORD_LENGTH,
  checkPassword,
  createSession,
  isAuthenticated,
  setPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let currentPassword = "";
  let newPassword = "";
  try {
    const body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!(await checkPassword(currentPassword))) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      {
        error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  await setPassword(newPassword);
  // Old sessions are now invalid (signing key changed) — issue a fresh one
  // for this browser so you stay logged in here.
  await createSession();
  return NextResponse.json({ ok: true });
}

