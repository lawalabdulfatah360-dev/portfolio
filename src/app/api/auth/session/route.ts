import { NextResponse } from "next/server";
import { getCredential, isAuthenticated } from "@/lib/auth";
import { storageMode } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  const cred = await getCredential();
  return NextResponse.json(
    {
      authenticated: await isAuthenticated(),
      storage: storageMode(),
      loginConfigured: true,
      usingDevDefault: cred.source === "initial",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
