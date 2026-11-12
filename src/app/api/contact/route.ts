import { NextResponse } from "next/server";
import {
  readPortfolioStore,
  writePortfolioStore,
  verifyAdminRequest,
} from "@/lib/store";
import type { ContactMessage } from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim();
    const message = (body.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const store = await readPortfolioStore();
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };

    store.messages = [newMsg, ...(store.messages ?? [])];
    await writePortfolioStore(store);

    return NextResponse.json({ ok: true, message: newMsg });
  } catch {
    return NextResponse.json(
      { error: "Could not save message." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id: string; read: boolean };
  const store = await readPortfolioStore();
  store.messages = (store.messages ?? []).map((m) =>
    m.id === body.id ? { ...m, read: body.read } : m
  );
  await writePortfolioStore(store);
  return NextResponse.json({ ok: true, messages: store.messages });
}

export async function DELETE(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const store = await readPortfolioStore();
  store.messages = (store.messages ?? []).filter((m) => m.id !== id);
  await writePortfolioStore(store);
  return NextResponse.json({ ok: true, messages: store.messages });
}

