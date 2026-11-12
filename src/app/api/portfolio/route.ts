import { NextResponse } from "next/server";
import {
  readPortfolioStore,
  writePortfolioStore,
  verifyAdminRequest,
} from "@/lib/store";
import {
  defaultPortfolioData,
  type PortfolioData,
} from "@/lib/portfolio-types";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await readPortfolioStore();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function PUT(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid admin password." },
      { status: 401 }
    );
  }

  try {
    const incoming = (await request.json()) as PortfolioData;
    const saved = await writePortfolioStore(incoming);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { error: "Invalid portfolio payload." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const authorized = await verifyAdminRequest(request);
  if (!authorized) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid admin password." },
      { status: 401 }
    );
  }

  const current = await readPortfolioStore();
  const resetData: PortfolioData = {
    ...defaultPortfolioData,
    messages: current.messages,
  };
  const saved = await writePortfolioStore(resetData);
  return NextResponse.json(saved);
}

