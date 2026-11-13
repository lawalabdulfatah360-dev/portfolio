import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getMessages, saveMessages } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { id?: string; read?: boolean };
  const messages = (await getMessages()).map((m) =>
    m.id === body.id ? { ...m, read: Boolean(body.read) } : m
  );
  await saveMessages(messages);
  return NextResponse.json({ messages });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  const messages = (await getMessages()).filter((m) => m.id !== id);
  await saveMessages(messages);
  return NextResponse.json({ messages });
}

