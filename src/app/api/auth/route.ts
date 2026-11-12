import { NextResponse } from "next/server";
import {
  getAdminPassword,
  setAdminPassword,
  verifyAdminRequest,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const actual = await getAdminPassword();
    if (body.password === actual) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "Incorrect admin password." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { newPassword?: string };
    const nextPass = (body.newPassword ?? "").trim();
    if (nextPass.length < 4) {
      return NextResponse.json(
        { error: "Password must be at least 4 characters." },
        { status: 400 }
      );
    }
    await setAdminPassword(nextPass);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password." },
      { status: 500 }
    );
  }
}

