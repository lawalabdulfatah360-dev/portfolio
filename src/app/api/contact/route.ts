import { NextResponse } from "next/server";
import { getMessages, saveMessages } from "@/lib/content";
import type { ContactMessage } from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: { name?: unknown; email?: unknown; message?: unknown; company?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot field: real visitors never fill it in.
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";

  if (!name || !EMAIL_RE.test(email) || !message) {
    return NextResponse.json(
      { error: "Please provide your name, a valid email, and a message." },
      { status: 400 }
    );
  }

  try {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const existing = await getMessages();
    await saveMessages([newMsg, ...existing].slice(0, 500));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to save message:", err);
    return NextResponse.json({ error: "Could not save message." }, { status: 500 });
  }
}
