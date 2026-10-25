import { NextResponse } from "next/server";
import { trackServer } from "@/lib/analytics";

const ALLOWED = new Set(["page_view", "begin_checkout"]);

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; path?: string } | null;
  if (!body?.name || !ALLOWED.has(body.name)) return NextResponse.json({ ok: false }, { status: 400 });
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : undefined;
  await trackServer(body.name as "page_view", path); // n'enregistre rien sans consentement
  return NextResponse.json({ ok: true });
}
