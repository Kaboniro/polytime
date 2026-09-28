import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminGuard";
import getDb from "@/lib/db";
import { getCrawlerStatus } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  return NextResponse.json(getCrawlerStatus());
}

// The dashboard only sets flags; the daemon (crawler/daemon.js) polls them
// every few seconds and acts.
export async function POST(req) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { action } = await req.json();
  const db = getDb();
  if (action === "run") {
    const { state } = getCrawlerStatus();
    if (!state.online) {
      return NextResponse.json({ error: "The crawler isn't running." }, { status: 409 });
    }
    if (state.state === "running") {
      return NextResponse.json({ error: "A run is already in progress." }, { status: 409 });
    }
    db.prepare("UPDATE crawler_state SET run_requested = 1 WHERE id = 1").run();
  } else if (action === "pause" || action === "resume") {
    db.prepare("UPDATE crawler_state SET paused = ? WHERE id = 1").run(action === "pause" ? 1 : 0);
  } else {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  return NextResponse.json(getCrawlerStatus());
}
